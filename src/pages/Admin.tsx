import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Home, Shield, UserCog } from "lucide-react";

interface Profile {
  full_name: string | null;
  email: string | null;
}

export default function Admin() {
  const { user, roles, isAdmin, isSecretary, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container-narrow py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-xl font-bold">Panel administrativo</h1>
            <p className="text-xs text-primary-foreground/70">
              {profile?.full_name ?? user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outlineLight" size="sm">
              <Link to="/">
                <Home className="w-4 h-4" /> Sitio público
              </Link>
            </Button>
            <Button variant="outlineLight" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container-narrow py-10 space-y-8">
        {/* Bienvenida + roles */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">
              Bienvenido, {profile?.full_name ?? "usuario"}
            </CardTitle>
            <CardDescription>
              Tus roles actuales:&nbsp;
              {roles.length === 0 ? (
                <span className="text-destructive font-medium">
                  Sin rol asignado — pide al administrador que te asigne uno.
                </span>
              ) : (
                roles.map((r) => (
                  <Badge key={r} variant="secondary" className="mr-1">
                    {r === "admin" ? "Administrador" : "Secretaria"}
                  </Badge>
                ))
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Módulos disponibles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin && (
            <Card className="border-accent/30">
              <CardHeader>
                <Shield className="w-8 h-8 text-accent mb-2" />
                <CardTitle className="text-lg">Gestión de personal</CardTitle>
                <CardDescription>
                  Asigna roles a las secretarias y administradores. (Próxima fase)
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {(isAdmin || isSecretary) && (
            <Card>
              <CardHeader>
                <UserCog className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Clientes y trámites</CardTitle>
                <CardDescription>
                  Gestiona los formularios DS-160 enviados. (Fase 4)
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              <strong className="text-primary">Siguiente paso:</strong> en la
              Fase 4 construiremos la gestión completa (CRUD de servicios,
              personal, clientes, videos y reseñas), y luego la analítica con
              gráfica circular en la Fase 6.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
