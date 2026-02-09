import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-foreground">Your Cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-lg text-muted-foreground">Your cart is empty</p>
            <Link to="/gifts">
              <Button className="mt-6 rounded-full px-8">Browse Gifts</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 rounded-2xl border bg-card p-4">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-semibold text-foreground">{item.name}</h3>
                      {item.customization.text && (
                        <p className="text-xs text-muted-foreground">Custom: "{item.customization.text}"</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total >= 50 ? "Free" : "$4.99"}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>${(total >= 50 ? total : total + 4.99).toFixed(2)}</span>
                </div>
              </div>
              {user ? (
                <Link to="/checkout">
                  <Button className="mt-6 w-full rounded-full">Proceed to Checkout</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="mt-6 w-full rounded-full">Sign In to Checkout</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
