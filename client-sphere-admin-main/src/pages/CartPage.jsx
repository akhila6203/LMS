import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Upload } from "lucide-react";
import { toast } from "sonner";

// import cartService from "@/services/cartService";
import { cartService } from "@/services/cartService";
import axiosClient from "@/api/axiosClient";

import { PageWithFooter } from "@/components/layout/PageWithFooter";
import { getSessionUser } from "@/utils/authSession";
import { cartTotals, formatRupee, getItemPayableTotal } from "@/utils/coursePricing";
import { orderService } from "@/services/orderService";


export default function CartPage() {
  const navigate = useNavigate();
  const user = getSessionUser();
  const isLoggedInUser = user && user.role !== "admin";

  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [cashPayment, setCashPayment] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);

  const totals = useMemo(() => cartTotals(cartItems), [cartItems]);

  const refreshCart = async () => {
  setPricingLoading(true);

  try {
    const res = await cartService.getMyCart();

    setCartItems(res.data.cart || []);

    window.dispatchEvent(
      new Event("cartChanged")
    );
  } catch (err) {
    console.error(err);
  } finally {
    setPricingLoading(false);
  }
};
//   const refreshCart = async () => {
//   setPricingLoading(true);

//   try {
//     const res = await cartService.getMyCart();

//     setCartItems(res.data.cart || []);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setPricingLoading(false);
//   }
// };

  useEffect(() => {
  refreshCart();
}, []);

  useEffect(() => {
    if (!isLoggedInUser) return;
    orderService
      .getMy()
      .then((res) => setPastOrders(res.data.orders || []))
      .catch(() => {});
  }, [isLoggedInUser, step]);


  const handleRemove = async (courseId) => {
  try {
    await cartService.removeFromCart(courseId);
    window.dispatchEvent(
      new Event("cartChanged")
    );
    toast.success("Removed from cart");
    refreshCart();
    // await cartService.removeFromCart(courseId);
    // toast.success("Removed from cart");
    // refreshCart();
  } catch (err) {
    toast.error("Failed to remove");
  }
};

  const proceedCheckout = () => {
    if (!isLoggedInUser) {
      navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
      return;
    }
    setStep(2);
  };

  const submitOrder = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!cashPayment) {
      toast.error("Please confirm cash payment");
      return;
    }
    if (!receipt) {
      toast.error("Upload payment receipt photo");
      return;
    }

    const formData = new FormData();
    formData.append("customerName", name.trim());
    formData.append("customerEmail", email.trim());
    formData.append("paymentMethod", "cash");
    cartItems.forEach((c) => formData.append("courseIds[]", c.id));
    formData.append("receipt", receipt);

    setSubmitting(true);
    try {
      await orderService.create(formData);
        await orderService.create(formData);
          await cartService.clearCart();

          setCartItems([]);
          window.dispatchEvent(new Event("cartChanged"));

          setStep(3);
      toast.success("Order submitted. Admin will verify your payment.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWithFooter variant={isLoggedInUser ? "user" : "public"}>
      <div
        className={
          isLoggedInUser
            ? "w-full sm:py-1"
            : "mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
        }
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Billing</h1>

        <div className="flex items-center justify-center mb-8">
          {["Cart", "Checkout", "Submitted"].map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold
                    ${step === s ? "bg-purple-600 text-white" : step > s ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}
                  >
                    {s}
                  </div>
                  <span className="text-xs mt-2">{label}</span>
                </div>
                {i !== 2 && (
                  <div className="w-10 sm:w-16 md:w-20 h-[2px] bg-gray-300 mx-2 relative top-[-10px]">
                    <div className={`h-full ${step > s ? "bg-green-500" : ""}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold">Cart</h2>
              {pricingLoading ? (
                <div className="border rounded-xl p-8 text-center text-gray-500">
                  Loading cart…
                </div>
              ) : cartItems.length === 0 ? (
                <div className="border rounded-xl p-8 text-center text-gray-500">
                  <p>Your cart is empty</p>
                  <button
                    type="button"
                    onClick={() => navigate("/courses")}
                    className="mt-4 text-purple-600 font-medium text-sm hover:underline"
                  >
                    Browse courses
                  </button>
                </div>
              ) : (
                cartItems.map((c) => {
                  const payable = getItemPayableTotal(c);
                  return (
                    <div
                      key={c.id}
                      className="border p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                    >
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-full sm:w-32 h-32 sm:h-20 object-cover rounded"
                        />
                      ) : (
                        <div
                          className={`w-full sm:w-32 h-32 sm:h-20 rounded bg-gradient-to-br ${c.cover || "from-purple-500 to-indigo-500"}`}
                        />
                      )}
                      <div className="flex-1">
                        <h3
                          onClick={() => navigate(`/courses/${c.id}`)}
                          className="font-semibold cursor-pointer hover:text-purple-600"
                        >
                          {c.title}
                        </h3>
                        <p className="text-sm text-gray-500">{c.category}</p>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-right">
                        {/* <p className="font-bold">{formatRupee(totals.subtotal)}</p> */}
                        <p className="font-bold">
                          {formatRupee(getItemPayableTotal(c))}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemove(c.id)}
                          className="text-red-500 text-xs mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

<div className="border p-5 rounded-xl h-fit space-y-4 mt-8 lg:mt-12">
  <h3 className="font-bold text-lg border-b pb-2">
    Price Details
  </h3>

  <div className="flex justify-between text-sm">
    <span>Total Amount</span>
    <span>{formatRupee(totals.subtotal)}</span>
  </div>

  <div className="flex justify-between text-sm text-green-600">
    <span>Discount</span>
    <span>- {formatRupee(totals.discount)}</span>
  </div>

  <hr />

  <div className="flex justify-between font-bold text-lg">
    <span>Final Amount</span>
    <span>{formatRupee(totals.total)}</span>
  </div>

  <button
    type="button"
    disabled={cartItems.length === 0 || pricingLoading}
    onClick={proceedCheckout}
    className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50"
  >
    Proceed to Checkout
  </button>
</div>
            
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 max-w-xl border p-4 sm:p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-bold">Checkout</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border p-2 rounded"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full border p-2 rounded"
              />

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashPayment}
                  onChange={(e) => setCashPayment(e.target.checked)}
                  className="accent-purple-600"
                />
                <Check className="h-4 w-4 text-green-600" />
                Cash payment (tick to confirm)
              </label>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload receipt photo
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-muted/50">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {receipt ? receipt.name : "Click to upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full border py-2 rounded"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submitOrder}
                  className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit for verification"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border p-4 rounded-xl space-y-2">
                <h3 className="font-semibold">Order summary</h3>
                {cartItems.map((c) => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1 flex-1 pr-2">{c.title}</span>
                    <span>{formatRupee(getItemPayableTotal(c))}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatRupee(totals.total)}</span>
                </div>
              </div>

              {pastOrders.length > 0 && (
                <div className="border p-4 rounded-xl">
                  <h3 className="font-semibold text-sm mb-2">Your purchases</h3>
                  <ul className="space-y-2 text-xs max-h-48 overflow-y-auto">
                    {pastOrders.slice(0, 5).map((o) => (
                      <li key={o.id} className="flex justify-between gap-2">
                        <span>Order #{o.id}</span>
                        <span
                          className={
                            o.status === "approved"
                              ? "text-green-600"
                              : o.status === "rejected"
                                ? "text-red-600"
                                : "text-amber-600"
                          }
                        >
                          {o.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-3xl font-bold text-green-600">Order submitted</h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Admin will verify your cash payment and receipt. After approval, courses
              appear in My Learning with full access.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/settings?tab=learning")}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                My Learning
              </button>
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="border px-4 py-2 rounded"
              >
                Browse courses
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWithFooter>
  );
}


