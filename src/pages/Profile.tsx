import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, User } from "lucide-react";
import { Link } from "react-router-dom";


export default function Profile() {
  const { user, loading, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { role } = useAuth();

  {
    (role === "admin" || role === "owner") && (
      <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #eee", borderRadius: "12px" }}>
        <h3>Admin Panel</h3>

        <Link to="/admin/upload">
          <button style={{ marginTop: "12px" }}>
            Upload New Product
          </button>
        </Link>
      </div>
    )
  }

  const { data: orders } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const statusColor: Record<string, string> = {
    pending: "bg-accent/20 text-accent-foreground",
    processing: "bg-primary/20 text-primary",
    shipped: "bg-primary/20 text-primary",
    delivered: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-serif">{profile?.full_name || "User"}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full rounded-full" onClick={signOut}>Sign Out</Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl font-bold text-foreground">Order History</h2>
            {orders && orders.length > 0 ? (
              <div className="mt-4 space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColor[order.status] || ""} variant="secondary">{order.status}</Badge>
                        <span className="font-bold text-foreground">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-muted-foreground">No orders yet. Time to find the perfect gift!</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
