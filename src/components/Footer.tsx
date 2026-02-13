import { Link } from "react-router-dom";
import { Gift } from "lucide-react";
import { useScrollRevealAll } from "@/hooks/useScrollReveal";

export default function Footer() {
  useScrollRevealAll();

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4 stagger-children">
          <div className="scroll-reveal slide-left">
            <Link to="/" className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-bold">JU Makerspace</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Handcrafted 3D-printed gifts that turn emotions into keepsakes.
            </p>
          </div>
          <div className="scroll-reveal">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Shop</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/gifts?occasion=birthday" className="transition-colors duration-200 hover:text-primary hover:translate-x-1 inline-block">Birthday Gifts</Link>
              <Link to="/gifts?occasion=anniversary" className="transition-colors duration-200 hover:text-primary hover:translate-x-1 inline-block">Anniversary</Link>
              <Link to="/gifts?occasion=surprise" className="transition-colors duration-200 hover:text-primary hover:translate-x-1 inline-block">Surprises</Link>
              <Link to="/gifts?occasion=custom" className="transition-colors duration-200 hover:text-primary hover:translate-x-1 inline-block">Custom Gifts</Link>
            </nav>
          </div>
          <div className="scroll-reveal">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="cursor-default">About Us</span>
              <span className="cursor-default">Contact</span>
              <span className="cursor-default">FAQ</span>
            </nav>
          </div>
          <div className="scroll-reveal slide-right">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Promise</h4>
            <p className="text-sm text-muted-foreground">Every gift is made with care, precision, and a personal touch. Free shipping on orders above $50.</p>
          </div>
        </div>
        <div className="scroll-reveal mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 JU Makerspace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
