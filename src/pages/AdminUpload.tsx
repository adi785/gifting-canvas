import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

const CATEGORIES = [
  "custom",
  "birthday",
  "anniversary",
  "surprise",
  "wedding",
  "graduation",
];

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Surprise",
  "Wedding",
  "Graduation",
  "Holiday",
  "Just Because",
];

export default function AdminUpload() {
  const { role, user, loading } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [story, setStory] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("custom");
  const [occasions, setOccasions] = useState<string[]>([]);
  const [materials, setMaterials] = useState("");
  const [colors, setColors] = useState("");
  const [sizes, setSizes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] =
    useState("5-7 business days");
  const [isFeatured, setIsFeatured] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "admin" && role !== "owner") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Access Denied
          </h1>
          <p className="text-muted-foreground mt-2">
            You need admin privileges to access this page.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleOccasion = (occ: string) => {
    setOccasions((prev) =>
      prev.includes(occ)
        ? prev.filter((o) => o !== occ)
        : [...prev, occ]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !name || !price) {
      toast({
        title: "Missing fields",
        description: "Name and price are required.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrls: string[] = [];

      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(filePath, file);

          if (uploadError) {
            toast({
              title: "Upload failed",
              description: uploadError.message,
              variant: "destructive",
            });
            setUploading(false);
            return;
          }

          const { data } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

          imageUrls.push(data.publicUrl);
        }
      }

      const { error: dbError } = await supabase.from("products").insert({
        name,
        description,
        short_description: shortDescription,
        story,
        price: parseFloat(price),
        created_by: user.id,
        category,
        occasion: occasions,
        images: imageUrls,
        materials: materials
          ? materials.split(",").map((m) => m.trim())
          : [],
        colors: colors ? colors.split(",").map((c) => c.trim()) : [],
        sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
        estimated_delivery: estimatedDelivery,
        is_featured: isFeatured,
      });

      if (dbError) {
        toast({
          title: "Save failed",
          description: dbError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Product added!",
          description: `${name} has been added to the catalog.`,
        });

        setName("");
        setDescription("");
        setShortDescription("");
        setStory("");
        setPrice("");
        setCategory("custom");
        setOccasions([]);
        setMaterials("");
        setColors("");
        setSizes("");
        setFiles(null);
        setIsFeatured(false);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-8">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Personalized Name Lamp"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDesc">Short Description</Label>
            <Input
              id="shortDesc"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief tagline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Story / Why This Gift Works</Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Emotional story behind this gift"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Occasions</Label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  type="button"
                  key={occ}
                  onClick={() => toggleOccasion(occ)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    occasions.includes(occ)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary"
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materials">Materials</Label>
              <Input
                id="materials"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="PLA, Resin"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colors">Colors</Label>
              <Input
                id="colors"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="White, Black"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes</Label>
              <Input
                id="sizes"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S, M, L"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery">Estimated Delivery</Label>
            <Input
              id="delivery"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full text-sm text-muted-foreground"
              />
              {files && (
                <p className="text-sm text-muted-foreground mt-2">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Save Product"
            )}
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
