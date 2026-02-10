import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2, Upload, Plus, Package } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = ["custom", "birthday", "anniversary", "surprise", "wedding", "graduation"];
const OCCASIONS = ["Birthday", "Anniversary", "Surprise", "Wedding", "Graduation", "Holiday", "Just Because"];

interface Product {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  story: string | null;
  price: number;
  category: string;
  occasion: string[] | null;
  images: string[] | null;
  materials: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  estimated_delivery: string | null;
  is_featured: boolean | null;
  created_at: string;
}

export default function AdminProducts() {
  const { role, user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editShortDescription, setEditShortDescription] = useState("");
  const [editStory, setEditStory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("custom");
  const [editOccasions, setEditOccasions] = useState<string[]>([]);
  const [editMaterials, setEditMaterials] = useState("");
  const [editColors, setEditColors] = useState("");
  const [editSizes, setEditSizes] = useState("");
  const [editDelivery, setEditDelivery] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    setLoadingProducts(false);
  };

  useEffect(() => {
    if (role === "admin" || role === "owner") fetchProducts();
  }, [role]);

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditDescription(p.description || "");
    setEditShortDescription(p.short_description || "");
    setEditStory(p.story || "");
    setEditPrice(String(p.price));
    setEditCategory(p.category);
    setEditOccasions(p.occasion || []);
    setEditMaterials((p.materials || []).join(", "));
    setEditColors((p.colors || []).join(", "));
    setEditSizes((p.sizes || []).join(", "));
    setEditDelivery(p.estimated_delivery || "5-7 business days");
    setEditFeatured(p.is_featured || false);
    setNewFiles(null);
  };

  const toggleOccasion = (occ: string) => {
    setEditOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const handleSave = async () => {
    if (!editProduct || !user) return;
    setSaving(true);

    try {
      // Upload new images if any
      let imageUrls = editProduct.images || [];
      if (newFiles && newFiles.length > 0) {
        const uploaded: string[] = [];
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { error: upErr } = await supabase.storage.from("images").upload(filePath, file);
          if (upErr) {
            toast({ title: "Image upload failed", description: upErr.message, variant: "destructive" });
            setSaving(false);
            return;
          }
          const { data } = supabase.storage.from("images").getPublicUrl(filePath);
          uploaded.push(data.publicUrl);
        }
        imageUrls = [...imageUrls, ...uploaded];
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: editName,
          description: editDescription,
          short_description: editShortDescription,
          story: editStory,
          price: parseFloat(editPrice),
          category: editCategory,
          occasion: editOccasions,
          images: imageUrls,
          materials: editMaterials ? editMaterials.split(",").map((m) => m.trim()) : [],
          colors: editColors ? editColors.split(",").map((c) => c.trim()) : [],
          sizes: editSizes ? editSizes.split(",").map((s) => s.trim()) : [],
          estimated_delivery: editDelivery,
          is_featured: editFeatured,
        })
        .eq("id", editProduct.id);

      if (error) throw error;

      toast({ title: "Product updated!" });
      setEditProduct(null);
      await fetchProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product deleted" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const removeImage = (url: string) => {
    if (!editProduct) return;
    const updated = (editProduct.images || []).filter((img) => img !== url);
    setEditProduct({ ...editProduct, images: updated });
  };

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
          <h1 className="text-2xl font-heading font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Admin privileges required.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Manage Products</h1>
          </div>
          <Link to="/admin/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No products yet.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{p.name}</p>
                    {p.is_featured && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">₹{p.price} · {p.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingId === p.id}>
                        {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. The product will be permanently removed.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={editShortDescription} onChange={(e) => setEditShortDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Full Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Story</Label>
              <Textarea value={editStory} onChange={(e) => setEditStory(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
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
                      editOccasions.includes(occ)
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
                <Label>Materials</Label>
                <Input value={editMaterials} onChange={(e) => setEditMaterials(e.target.value)} placeholder="Comma-separated" />
              </div>
              <div className="space-y-2">
                <Label>Colors</Label>
                <Input value={editColors} onChange={(e) => setEditColors(e.target.value)} placeholder="Comma-separated" />
              </div>
              <div className="space-y-2">
                <Label>Sizes</Label>
                <Input value={editSizes} onChange={(e) => setEditSizes(e.target.value)} placeholder="Comma-separated" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estimated Delivery</Label>
              <Input value={editDelivery} onChange={(e) => setEditDelivery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="editFeatured" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)} className="rounded" />
              <Label htmlFor="editFeatured">Featured Product</Label>
            </div>

            {/* Existing images */}
            {editProduct?.images && editProduct.images.length > 0 && (
              <div className="space-y-2">
                <Label>Current Images</Label>
                <div className="flex flex-wrap gap-2">
                  {editProduct.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Add More Images</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                <input type="file" accept="image/*" multiple onChange={(e) => setNewFiles(e.target.files)} className="w-full text-sm text-muted-foreground" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
