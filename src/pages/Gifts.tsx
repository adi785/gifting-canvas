import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const occasions = ["all", "birthday", "anniversary", "surprise", "custom"];

export default function Gifts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOccasion = searchParams.get("occasion") || "all";
  const [occasion, setOccasion] = useState(initialOccasion);
  const [sortBy, setSortBy] = useState("popularity");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", occasion, sortBy],
    queryFn: async () => {
      let query = supabase.from("products").select("*");
      if (occasion !== "all") {
        query = query.contains("occasion", [occasion]);
      }
      if (sortBy === "price_asc") query = query.order("price", { ascending: true });
      else if (sortBy === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("popularity", { ascending: false });
      const { data } = await query;
      return data ?? [];
    },
  });

  const handleOccasionChange = (val: string) => {
    setOccasion(val);
    if (val === "all") searchParams.delete("occasion");
    else searchParams.set("occasion", val);
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Shop Gifts</h1>
        <p className="mt-2 text-muted-foreground">Find the perfect 3D-printed gift for every moment</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {occasions.map((o) => (
              <Button
                key={o}
                variant={occasion === o ? "default" : "outline"}
                size="sm"
                className="rounded-full capitalize"
                onClick={() => handleOccasionChange(o)}
              >
                {o === "all" ? "All" : o}
              </Button>
            ))}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="mt-16 text-center text-muted-foreground">Loading gifts...</div>
        ) : products && products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center text-muted-foreground">
            <p className="text-lg">No gifts found for this occasion yet.</p>
            <p className="mt-1 text-sm">Check back soon — we're crafting more!</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
