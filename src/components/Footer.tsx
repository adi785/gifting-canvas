import { Link } from "react-router-dom";
import { Gift } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-bold">GiftCraft</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Handcrafted 3D-printed gifts that turn emotions into keepsakes.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Shop</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/gifts?occasion=birthday" className="hover:text-foreground">Birthday Gifts</Link>
              <Link to="/gifts?occasion=anniversary" className="hover:text-foreground">Anniversary</Link>
              <Link to="/gifts?occasion=surprise" className="hover:text-foreground">Surprises</Link>
              <Link to="/gifts?occasion=custom" className="hover:text-foreground">Custom Gifts</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>About Us</span>
              <span>Contact</span>
              <span>FAQ</span>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Promise</h4>
            <p className="text-sm text-muted-foreground">Every gift is made with care, precision, and a personal touch. Free shipping on orders above $50.</p>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 GiftCraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
