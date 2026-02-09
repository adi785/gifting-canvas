import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "", zip: "", phone: "" });

  if (!user) return <Navigate to="/auth" replace />;
  if (items.length === 0 && !orderPlaced) return <Navigate to="/cart" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const grandTotal = total >= 50 ? total : total + 4.99;

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: user.id,
      total: grandTotal,
      shipping_name: form.name,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_state: form.state,
      shipping_zip: form.zip,
      shipping_phone: form.phone,
    }).select().single();

    if (orderError || !order) {
      toast({ title: "Order failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      customization: item.customization,
    }));

    await supabase.from("order_items").insert(orderItems);
    clearCart();
    setOrderPlaced(true);
    setSubmitting(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center px-4 py-20 text-center">
          <CheckCircle className="h-20 w-20 text-primary" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">Order Confirmed!</h1>
          <p className="mt-3 max-w-md text-muted-foreground">Thank you for your order. We're crafting your personalized gift with love.</p>
          <div className="mt-8 flex gap-4">
            <Button className="rounded-full" onClick={() => navigate("/profile")}>View Orders</Button>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/gifts")}>Continue Shopping</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-foreground">Checkout</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
            <h2 className="font-serif text-xl font-semibold">Shipping Address</h2>
            {[
              { id: "name", label: "Full Name", type: "text" },
              { id: "address", label: "Address", type: "text" },
              { id: "city", label: "City", type: "text" },
              { id: "state", label: "State", type: "text" },
              { id: "zip", label: "ZIP Code", type: "text" },
              { id: "phone", label: "Phone", type: "tel" },
            ].map((f) => (
              <div key={f.id} className="space-y-1">
                <Label htmlFor={f.id}>{f.label}</Label>
                <Input id={f.id} type={f.type} required value={form[f.id as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.id]: e.target.value })} />
              </div>
            ))}
            <Button type="submit" className="w-full rounded-full" disabled={submitting}>
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
          </form>

          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-serif text-lg font-semibold">Order Review</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total >= 50 ? "Free" : "$4.99"}</span></div>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>${(total >= 50 ? total : total + 4.99).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
