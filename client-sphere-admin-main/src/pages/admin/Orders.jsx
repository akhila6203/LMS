import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";
import { formatRupee } from "@/utils/coursePricing";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAdmin(filter || undefined);
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const verify = async (id, action) => {
    try {
      await orderService.verify(id, action);
      toast.success(action === "approve" ? "Order approved" : "Order rejected");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Payment verification</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No orders found.</Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="p-4 sm:p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">Order #{o.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.customerName} · {o.customerEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(o.createdAt).toLocaleString()} · {o.paymentMethod}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium capitalize ${
                    o.status === "approved"
                      ? "text-green-600"
                      : o.status === "rejected"
                        ? "text-red-600"
                        : "text-amber-600"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <ul className="text-sm space-y-1 mb-3">
                {o.items?.map((item) => (
                  <li key={item.courseId} className="flex justify-between">
                    <span>{item.title}</span>
                    <span>{formatRupee(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 text-sm mb-4">
                <span>Subtotal: {formatRupee(o.subtotal)}</span>
                <span className="text-green-600">Discount: -{formatRupee(o.discountAmount)}</span>
                <span className="font-semibold">Total: {formatRupee(o.totalAmount)}</span>
              </div>

              {o.receiptUrl && (
                <a
                  href={o.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-purple-600 underline block mb-4"
                >
                  View receipt photo
                </a>
              )}

              <div className="flex flex-wrap gap-2">
                {o.status !== "approved" && (
                  <Button size="sm" onClick={() => verify(o.id, "approve")}>
                    {o.status === "rejected" ? "Approve again" : "Approve"}
                  </Button>
                )}
                {o.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => verify(o.id, "reject")}
                  >
                    {o.status === "approved" ? "Reject" : "Reject"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
