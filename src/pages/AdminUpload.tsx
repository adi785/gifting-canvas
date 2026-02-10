import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

export default function AdminUpload() {
  const { role, user, loading } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  /* -------------------- Guards -------------------- */
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
          <p className="text-muted-foreground mt-2">
            You do not have permission to access this page.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  /* -------------------- Submit -------------------- */
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
      /* 1️⃣ Upload image (single or multiple) */
      const imageUrls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const path = `${user.id}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(path, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("images")
            .getPublicUrl(path);

          imageUrls.push(data.publicUrl);
        }
      }

      /* 2️⃣ Insert product (RLS SAFE) */
      const { error: insertError } = await supabase.from("products").insert({
        name,
        description,
        price: Number(price),
        images: imageUrls,
        created_by: user.id, // 🔥 REQUIRED FOR RLS
      });

      if (insertError) throw insertError;

      toast({
        title: "Product added",
        description: "Product uploaded successfully.",
      });

      /* 3️⃣ Reset form */
      setName("");
      setDescription("");
      setPrice("");
      setFiles(null);

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

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description"
            />
          </div>

          <div className="space-y-2">
            <Label>Price (₹) *</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="999"
            />
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-2 text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
              />
              {files && (
                <p className="text-sm text-muted-foreground mt-2">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
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
