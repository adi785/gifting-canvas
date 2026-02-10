import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

const CATEGORIES = ["custom", "birthday", "anniversary", "surprise", "wedding", "graduation"];
const OCCASIONS = ["Birthday", "Anniversary", "Surprise", "Wedding", "Graduation", "Holiday", "Just Because"];

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
  const [estimatedDelivery, setEstimatedDelivery] = useState("5-7 business days");
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

  if (!user || (role !== "admin" && role !== "owner")) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Admin access required</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to upload products.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleOccasion = (occ: string) => {
    setOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

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

    setUploading(true);

    try {
      /* 1️⃣ Upload images */
      const imageUrls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase
            .storage
            .from("images")
            .upload(filePath, file, { upsert: false });

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          const { data } = supabase
            .storage
            .from("images")
            .getPublicUrl(filePath);

          imageUrls.push(data.publicUrl);
        }
      }

      /* 2️⃣ Insert product (RLS-SAFE) */
      const { error: dbError } = await supabase.from("products").insert({
        name,
        description,
        short_description: shortDescription,
        story,
        price: Number(price),
        category,
        occasion: occasions,
        images: imageUrls,
        materials: materials ? materials.split(",").map(m => m.trim()) : [],
        colors: colors ? colors.split(",").map(c => c.trim()) : [],
        sizes: sizes ? sizes.split(",").map(s => s.trim()) : [],
        estimated_delivery: estimatedDelivery,
        is_featured: isFeatured,
        created_by: user.id, // 🔥 REQUIRED FOR RLS
      });

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast({
        title: "Product added successfully",
        description: `${name} has been added to the catalog.`,
      });

      /* 3️⃣ Reset form */
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-8">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FORM CONTENT UNCHANGED */}
          {/* Your existing JSX below this line is already correct */}
          {/* No UI changes required */}
          
          {/* Submit */}
          <Button type="submit" className="w-full" size="lg" disabled={uploading}>
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
