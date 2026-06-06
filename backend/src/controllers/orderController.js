const path = require("path");
const { query } = require("../utils/dbQuery");
const {
  accountTypeFromUser,
  lineTotal,
  mapPricingFromRow,
} = require("../utils/enrollmentHelpers");

async function fetchCoursePricing(courseId) {
  const rows = await query(
    "SELECT id, title, price, discount_percent, thumbnail, status FROM courses WHERE id = ? LIMIT 1",
    [courseId]
  );
  if (!rows.length || rows[0].status !== "Active") return null;
  return { ...rows[0], ...mapPricingFromRow(rows[0]) };
}

exports.createOrder = async (req, res) => {
  try {
    const accountType = accountTypeFromUser(req.user);
    const {
      customerName,
      customerEmail,
      paymentMethod = "cash",
    } = req.body;

    let courseIds = req.body.courseIds || req.body["courseIds[]"] || [];
    if (typeof courseIds === "string") courseIds = [courseIds];

    if (!customerName?.trim() || !customerEmail?.trim()) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const ids = [...new Set((courseIds || []).map((id) => Number(id)).filter(Boolean))];
    if (!ids.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const receiptFile = req.file;
    if (!receiptFile) {
      return res.status(400).json({ message: "Payment receipt photo is required" });
    }

    const receiptUrl = `${req.protocol}://${req.get("host")}/uploads/receipts/${receiptFile.filename}`;

    let subtotal = 0;
    let discountAmount = 0;
    const items = [];

    for (const courseId of ids) {
      const course = await fetchCoursePricing(courseId);
      if (!course) {
        return res.status(400).json({ message: `Course ${courseId} is not available` });
      }

      const unitPrice = Number(course.price) || 0;
      const discountPercent = Number(course.discount_percent) || 0;
      const final = lineTotal(unitPrice, discountPercent);
      const itemDiscount = unitPrice - final;

      subtotal += unitPrice;
      discountAmount += itemDiscount;
      items.push({ courseId, unitPrice, discountPercent, lineTotal: final, title: course.title });
    }

    const totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;

    const orderResult = await query(
      `INSERT INTO purchase_orders
        (user_id, account_type, customer_name, customer_email, payment_method,
         subtotal, discount_amount, total_amount, receipt_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.id,
        accountType,
        customerName.trim(),
        customerEmail.trim(),
        paymentMethod,
        subtotal,
        discountAmount,
        totalAmount,
        receiptUrl,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await query(
        `INSERT INTO purchase_order_items
          (order_id, course_id, unit_price, discount_percent, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.courseId, item.unitPrice, item.discountPercent, item.lineTotal]
      );
    }

    res.status(201).json({
      message: "Order submitted. Admin will verify your payment.",
      order: {
        id: orderId,
        status: "pending",
        subtotal,
        discountAmount,
        totalAmount,
        items,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const accountType = accountTypeFromUser(req.user);
    const orders = await query(
      `SELECT id, customer_name, customer_email, payment_method, subtotal, discount_amount,
              total_amount, receipt_url, status, created_at, verified_at
       FROM purchase_orders
       WHERE user_id = ? AND account_type = ?
       ORDER BY id DESC`,
      [req.user.id, accountType]
    );

    const withItems = [];
    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, c.title, c.thumbnail
         FROM purchase_order_items oi
         JOIN courses c ON c.id = oi.course_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      withItems.push({
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        paymentMethod: order.payment_method,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discount_amount),
        totalAmount: Number(order.total_amount),
        receiptUrl: order.receipt_url,
        status: order.status,
        createdAt: order.created_at,
        verifiedAt: order.verified_at,
        items: items.map((i) => ({
          courseId: i.course_id,
          title: i.title,
          thumbnail: i.thumbnail,
          unitPrice: Number(i.unit_price),
          discountPercent: Number(i.discount_percent),
          lineTotal: Number(i.line_total),
        })),
      });
    }

    res.json({ orders: withItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT o.*, 
      (SELECT COUNT(*) FROM purchase_order_items WHERE order_id = o.id) AS item_count
      FROM purchase_orders o`;
    const params = [];
    if (status) {
      sql += " WHERE o.status = ?";
      params.push(status);
    }
    sql += " ORDER BY o.id DESC LIMIT 200";

    const orders = await query(sql, params);
    const result = [];

    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, c.title FROM purchase_order_items oi
         JOIN courses c ON c.id = oi.course_id WHERE oi.order_id = ?`,
        [order.id]
      );
      result.push({
        id: order.id,
        userId: order.user_id,
        accountType: order.account_type,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        paymentMethod: order.payment_method,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discount_amount),
        totalAmount: Number(order.total_amount),
        receiptUrl: order.receipt_url,
        status: order.status,
        adminNote: order.admin_note,
        createdAt: order.created_at,
        verifiedAt: order.verified_at,
        itemCount: order.item_count,
        items: items.map((i) => ({
          courseId: i.course_id,
          title: i.title,
          unitPrice: Number(i.unit_price),
          discountPercent: Number(i.discount_percent),
          lineTotal: Number(i.line_total),
        })),
      });
    }

    res.json({ orders: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.verifyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "action must be approve or reject" });
    }

    const orders = await query("SELECT * FROM purchase_orders WHERE id = ? LIMIT 1", [id]);
    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];
    const previousStatus = order.status;
    const newStatus = action === "approve" ? "approved" : "rejected";

    if (previousStatus === newStatus) {
      return res.json({
        message: `Order is already ${newStatus}.`,
        status: newStatus,
      });
    }

    await query(
      `UPDATE purchase_orders
       SET status = ?, admin_note = ?, verified_by = ?, verified_at = NOW()
       WHERE id = ?`,
      [newStatus, adminNote || null, req.user.id, id]
    );

    const items = await query(
      "SELECT course_id FROM purchase_order_items WHERE order_id = ?",
      [id]
    );

    if (action === "approve") {
      for (const item of items) {
        const existing = await query(
          `SELECT id, status FROM course_enrollments
           WHERE user_id = ? AND account_type = ? AND course_id = ? LIMIT 1`,
          [order.user_id, order.account_type, item.course_id]
        );

        const wasActive = existing.length && existing[0].status === "active";

        if (existing.length) {
          await query(
            `UPDATE course_enrollments
             SET order_id = ?, status = 'active', purchased_at = COALESCE(purchased_at, NOW())
             WHERE id = ?`,
            [id, existing[0].id]
          );
        } else {
          await query(
            `INSERT INTO course_enrollments
              (user_id, account_type, course_id, order_id, status, started_at)
             VALUES (?, ?, ?, ?, 'active', NOW())`,
            [order.user_id, order.account_type, item.course_id, id]
          );
        }

        if (!wasActive) {
          await query(
            "UPDATE courses SET students = students + 1 WHERE id = ?",
            [item.course_id]
          );
        }
      }
    } else if (previousStatus === "approved") {
      for (const item of items) {
        const existing = await query(
          `SELECT id, status FROM course_enrollments
           WHERE user_id = ? AND account_type = ? AND course_id = ? LIMIT 1`,
          [order.user_id, order.account_type, item.course_id]
        );

        if (existing.length && existing[0].status === "active") {
          await query(
            `UPDATE course_enrollments SET status = 'pending', order_id = NULL WHERE id = ?`,
            [existing[0].id]
          );
          await query(
            "UPDATE courses SET students = GREATEST(0, students - 1) WHERE id = ?",
            [item.course_id]
          );
        }
      }
    }

    if (order.account_type === "google") {
      const enrolledRows = await query(
        `SELECT COUNT(*) AS c FROM course_enrollments
         WHERE user_id = ? AND account_type = 'google' AND status = 'active'`,
        [order.user_id]
      );
      const completedRows = await query(
        `SELECT COUNT(*) AS c FROM course_enrollments
         WHERE user_id = ? AND account_type = 'google' AND status = 'completed'`,
        [order.user_id]
      );
      const enrolled = Number(enrolledRows[0]?.c) || 0;
      const completed = Number(completedRows[0]?.c) || 0;
      const progress =
        enrolled > 0 ? Math.min(100, Math.round((completed / enrolled) * 100)) : 0;
      await query(
        `UPDATE google_student_profiles SET enrolled = ?, completed = ?, progress = ?
         WHERE user_id = ?`,
        [enrolled, completed, progress, order.user_id]
      );
    }

    const statusMessages = {
      approved: "Order approved. Courses unlocked for student.",
      rejected: "Order rejected.",
    };

    res.json({
      message: statusMessages[newStatus],
      status: newStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify order" });
  }
};
