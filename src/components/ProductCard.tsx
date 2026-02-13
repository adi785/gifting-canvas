import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<"products">;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || "/placeholder.svg";

  return (
    <Link to={`/gifts/${product.id}`}>
      <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="aspect-square overflow-hidden bg-secondary/50">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-1 font-serif text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.short_description}
          </p>
          <p className="mt-2 text-lg font-bold text-primary">
            ${Number(product.price).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
