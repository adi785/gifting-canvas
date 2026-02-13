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
  console.log("AUTH USER:", user);
  console.log("AUTH ROLE:", role);


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

  /* ---------- Guards ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (role !== "admin" && role !== "owner")) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Admin access required</h1>
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

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      toast({
        title: "Missing fields",
        description: "Product name and price are required.",
        variant: "destructive",
      });
      return;
    }

    if (!files || files.length < 2 || files.length > 4) {
      toast({
        title: "Images required",
        description: "Please select 2 to 4 images.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      /* Upload images */
      const imageUrls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          const { error } = await supabase.storage
            .from("images")
            .upload(filePath, file);

          if (error) throw error;

          const { data } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

          imageUrls.push(data.publicUrl);
        }
      }

      /* 🔥 RLS-SAFE INSERT */
      const { error: dbError } = await supabase.from("products").insert({
        name,
        description,
        short_description: shortDescription,
        story,
        price: Number(price),
        category,
        occasions,            // ✅ MATCHES DB COLUMN
        images: imageUrls,
        materials: materials
          ? materials.split(",").map((m) => m.trim())
          : [],
        colors: colors ? colors.split(",").map((c) => c.trim()) : [],
        sizes: sizes ? sizes.split(",").map((s) => s.trim()) : [],
        estimated_delivery: estimatedDelivery,
        is_featured: isFeatured,
        created_by: user.id,  // ✅ REQUIRED BY RLS
      });

      if (dbError) throw dbError;

      toast({
        title: "Product added successfully",
        description: `${name} has been added.`,
      });

      /* Reset */
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

    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Product Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Short Description</Label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Full Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Story</Label>
            <Textarea value={story} onChange={(e) => setStory(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Occasions</Label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  type="button"
                  key={occ}
                  onClick={() => toggleOccasion(occ)}
                  className={`px-3 py-1 border rounded ${
                    occasions.includes(occ)
                      ? "bg-primary text-white"
                      : ""
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Images (2–4 required) *</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <Upload className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Select 2 to 4 images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files;
                  if (selected && selected.length > 4) {
                    toast({ title: "Too many images", description: "Please select up to 4 images.", variant: "destructive" });
                    e.target.value = "";
                    setFiles(null);
                    return;
                  }
                  setFiles(selected);
                }}
                className="w-full text-sm text-muted-foreground"
              />
            </div>
            {files && files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Array.from(files).map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i + 1}`}
                      className="h-20 w-20 rounded-lg object-cover border border-border"
                    />
                    <span className="absolute bottom-0 right-0 bg-background/80 text-xs px-1 rounded-tl">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
            {files && (files.length < 2) && (
              <p className="text-sm text-destructive mt-1">Please select at least 2 images.</p>
            )}
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Save Product"}
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

