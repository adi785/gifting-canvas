import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { supabase } from "@/integrations/supabase/client";

export default function AdminUpload() {
    const { role, user, loading } = useAuth();
    console.log("DEBUG ROLE:", role);
    console.log("DEBUG USER ID:", user?.id);
    if (loading) return <p>Loading...</p>;
    if (role !== "admin" && role !== "owner") {
        return <p>Admin access required</p>;
    }

    return (
        <div>
            <h1>Add Product</h1>
            {/* upload form */}
        </div>
    );
}

const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [price, setPrice] = useState("");
const [file, setFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);

if (loading) return <p>Loading...</p>;
if (role !== "admin" && role !== "owner")
    return <p>Admin access required</p>;

const handleSubmit = async () => {
    if (!file || !user) return alert("Missing fields");

    setUploading(true);

    // 1️⃣ Upload image
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

    if (uploadError) {
        setUploading(false);
        return alert("Image upload failed");
    }

    // 2️⃣ Get public URL
    const { data } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

    // 3️⃣ Insert product
    const { error: dbError } = await supabase.from("products").insert({
        name,
        description,
        price,
        image_url: data.publicUrl,
        created_by: user.id,
    });

    setUploading(false);

    if (dbError) {
        alert("Product save failed");
    } else {
        alert("Product added successfully");
        setName("");
        setDescription("");
        setPrice("");
        setFile(null);
    }
};

return (
    <div>
        <h1>Add Product</h1>

        <input
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />

        <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />

        <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
        />

        <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Uploading..." : "Save Product"}
        </button>
    </div>
);
}
