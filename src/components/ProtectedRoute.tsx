import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Si se especifica, requiere alguno de estos roles */
  requireRoles?: Array<"admin" | "secretary">;
}

export const ProtectedRoute = ({ children, requireRoles }: Props) => {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRoles && !requireRoles.some((r) => roles.includes(r))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="font-serif text-2xl font-bold text-primary">
            Acceso restringido
          </h1>
          <p className="text-muted-foreground">
            Tu cuenta no tiene los permisos necesarios para acceder a esta
            sección. Pide al administrador que te asigne el rol adecuado.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
