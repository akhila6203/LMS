const { query } = require("../utils/dbQuery");

exports.addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;

    await query(
      `
      INSERT IGNORE INTO cart_items
      (user_id, course_id)
      VALUES (?, ?)
      `,
      [req.user.id, courseId]
    );

    res.json({
      message: "Added to cart",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to add cart",
    });
  }
};

exports.getMyCart = async (req, res) => {
  try {
    const rows = await query(
      `
      SELECT
      c.id,
      c.title,
      c.thumbnail,
      c.price,
      c.discount_percent

      FROM cart_items ci

      JOIN courses c
      ON c.id = ci.course_id

      WHERE ci.user_id = ?
      `,
      [req.user.id]
    );

    res.json({
      cart: rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;

    await query(
      `
      DELETE FROM cart_items
      WHERE user_id = ?
      AND course_id = ?
      `,
      [req.user.id, courseId]
    );

    res.json({
      message: "Removed",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed",
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await query(
      `DELETE FROM cart_items WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};