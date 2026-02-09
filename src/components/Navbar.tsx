import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, Gift, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/gifts", label: "Shop Gifts" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">Fabino</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={signOut} className="hidden md:flex">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-serif">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)} className="text-lg font-medium text-foreground">Profile</Link>
                    <button onClick={() => { signOut(); setOpen(false); }} className="text-left text-lg font-medium text-muted-foreground">Sign Out</button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)} className="text-lg font-medium text-primary">Sign In</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
