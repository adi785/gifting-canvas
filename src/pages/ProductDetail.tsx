import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customText, setCustomText] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-20 text-center text-muted-foreground">Loading...</div></div>;
  if (!product) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-20 text-center text-muted-foreground">Product not found</div></div>;

  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const imageUrl = images[0];

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to add items to your cart", variant: "destructive" });
      navigate("/auth");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: imageUrl,
      customization: { text: customText, color: selectedColor, material: selectedMaterial, size: selectedSize },
    });
    toast({ title: "Added to cart!", description: `${product.name} has been added to your cart.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Customization */}
          <div className="order-2 lg:order-1">
            <Badge variant="secondary" className="capitalize">{product.category}</Badge>
            <h1 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
            <p className="mt-2 text-2xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
            <p className="mt-4 text-muted-foreground">{product.description}</p>

            <div className="mt-8 space-y-6">
              <div>
                <Label className="text-sm font-semibold">Personalize Your Text</Label>
                <Input className="mt-2" placeholder="Enter your custom message..." value={customText} onChange={(e) => setCustomText(e.target.value)} />
              </div>

              {product.colors && product.colors.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Color</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <Button key={c} variant={selectedColor === c ? "default" : "outline"} size="sm" className="rounded-full capitalize" onClick={() => setSelectedColor(c)}>{c}</Button>
                    ))}
                  </div>
                </div>
              )}

              {product.materials && product.materials.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Material</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.materials.map((m) => (
                      <Button key={m} variant={selectedMaterial === m ? "default" : "outline"} size="sm" className="rounded-full capitalize" onClick={() => setSelectedMaterial(m)}>{m}</Button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Size</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <Button key={s} variant={selectedSize === s ? "default" : "outline"} size="sm" className="rounded-full capitalize" onClick={() => setSelectedSize(s)}>{s}</Button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleAddToCart} size="lg" className="w-full rounded-full">
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
              </Button>

              <div className="flex gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> {product.estimated_delivery}</span>
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Quality guaranteed</span>
              </div>
            </div>

            {/* Story */}
            {product.story && (
              <div className="mt-10 rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground">Why This Gift Works</h3>
                <p className="mt-2 text-sm text-muted-foreground">{product.story}</p>
              </div>
            )}
          </div>

          {/* Right: Image + Preview */}
          <div className="order-1 lg:order-2 space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl bg-secondary/30">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} - Image ${i + 1}`}
                    className="aspect-square w-full shrink-0 object-cover"
                  />
                ))}
              </div>

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={cn(
                          "h-2 w-2 rounded-full transition-all duration-300",
                          i === currentImageIndex ? "w-6 bg-primary" : "bg-background/70"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300",
                      i === currentImageIndex ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {customText && (
              <div className="rounded-2xl border bg-card p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live Preview</p>
                <p className="mt-3 font-serif text-2xl text-foreground">{customText}</p>
                {selectedColor && <p className="mt-1 text-sm text-muted-foreground">Color: {selectedColor}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
