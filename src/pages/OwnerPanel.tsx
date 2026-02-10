import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ShieldOff, Crown } from "lucide-react";

interface ProfileWithRole {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  isAdmin: boolean;
}

export default function OwnerPanel() {
  const { role, loading } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithRole[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    // Fetch all profiles (owner has RLS access)
    const { data: allProfiles, error: profErr } = await supabase
      .from("all_profiles")
      .select("user_id, full_name, avatar_url");

    if (profErr) {
      toast({ title: "Error loading users", description: profErr.message, variant: "destructive" });
      setLoadingProfiles(false);
      return;
    }

    // Fetch all admin roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const adminIds = new Set(
      (roles || []).filter((r) => r.role === "admin").map((r) => r.user_id)
    );
    const ownerIds = new Set(
      (roles || []).filter((r) => r.role === "owner").map((r) => r.user_id)
    );

    setProfiles(
      (allProfiles || [])
        .filter((p) => !ownerIds.has(p.user_id)) // Don't show owners
        .map((p) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          isAdmin: adminIds.has(p.user_id),
        }))
    );
    setLoadingProfiles(false);
  };

  useEffect(() => {
    if (role === "owner") {
      fetchProfiles();
    }
  }, [role]);

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    setTogglingId(userId);
    try {
      if (currentlyAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
        toast({ title: "Admin removed", description: "User no longer has admin access." });
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
        if (error) throw error;
        toast({ title: "Admin assigned", description: "User now has admin access." });
      }
      await fetchProfiles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "owner") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground">Owner Access Required</h1>
          <p className="text-muted-foreground mt-2">Only the platform owner can manage admin roles.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-foreground">Manage Admins</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Select users to grant admin access. Admins can add, edit, and manage products in the catalog.
        </p>

        {loadingProfiles ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No users found. Users will appear here once they sign up.</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div
                key={p.user_id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {p.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{p.full_name || "Unnamed User"}</p>
                    <p className="text-xs text-muted-foreground">{p.user_id.slice(0, 8)}...</p>
                  </div>
                </div>

                <Button
                  variant={p.isAdmin ? "destructive" : "default"}
                  size="sm"
                  disabled={togglingId === p.user_id}
                  onClick={() => toggleAdmin(p.user_id, p.isAdmin)}
                >
                  {togglingId === p.user_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : p.isAdmin ? (
                    <>
                      <ShieldOff className="h-4 w-4 mr-1" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Make Admin
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
