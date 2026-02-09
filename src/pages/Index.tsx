import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Cake, Heart, Sparkles, Star, Truck, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const occasions = [
  { name: "Birthday", icon: Cake, color: "bg-primary/10 text-primary" },
  { name: "Anniversary", icon: Heart, color: "bg-accent/10 text-accent" },
  { name: "Surprise", icon: Sparkles, color: "bg-primary/10 text-primary" },
  { name: "Custom", icon: Gift, color: "bg-accent/10 text-accent" },
];

export default function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_featured", true).limit(4);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <div className="container text-center">
          <h1 className="mx-auto max-w-3xl animate-fade-in font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Turn your feelings into something they can{" "}
            <span className="text-primary">hold</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "0.1s", animationFillMode: "forwards", opacity: 0, animation: "fade-in 0.5s ease-out 0.15s forwards" }}>
            Handcrafted, 3D-printed gifts designed to carry your love, memories, and personal touch — for every occasion.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4" style={{ animationDelay: "0.2s", animationFillMode: "forwards", opacity: 0, animation: "fade-in 0.5s ease-out 0.3s forwards" }}>
            <Link to="/gifts">
              <Button size="lg" className="rounded-full px-8">Personalize a Gift</Button>
            </Link>
            <Link to="/gifts">
              <Button size="lg" variant="outline" className="rounded-full px-8">Explore Ideas</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="px-4 py-16">
        <div className="container">
          <h2 className="text-center font-serif text-3xl font-bold text-foreground">
            What's the occasion?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-muted-foreground">
            Every moment deserves a thoughtful, one-of-a-kind gift
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {occasions.map((o) => (
              <Link to={`/gifts?occasion=${o.name.toLowerCase()}`} key={o.name}>
                <Card className="group cursor-pointer border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${o.color} transition-transform group-hover:scale-110`}>
                      <o.icon className="h-7 w-7" />
                    </div>
                    <span className="font-serif text-lg font-semibold text-foreground">{o.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="px-4 py-16">
          <div className="container">
            <h2 className="text-center font-serif text-3xl font-bold text-foreground">
              Featured Gifts
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-muted-foreground">
              Our most loved, most gifted creations
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/gifts">
                <Button variant="outline" className="rounded-full px-8">View All Gifts</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="px-4 py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Star, title: "Premium Quality", desc: "Every item is crafted with precision using high-quality 3D printing materials" },
              { icon: Truck, title: "Fast Delivery", desc: "Most orders ship within 3-5 business days, right to your doorstep" },
              { icon: Shield, title: "Satisfaction Guaranteed", desc: "Not happy? We'll make it right. Your joy is our mission" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
