import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
  Share2,
  Star,
  LogOut,
  Home,
  Menu,
  ClipboardList,
  Tags,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItemsAdmin = [
  { to: "/admin", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/admin/ds160", icon: ClipboardList, label: "Solicitudes DS-160" },
  { to: "/admin/categorias", icon: Tags, label: "Categorías" },
  { to: "/admin/servicios", icon: Briefcase, label: "Servicios" },
  { to: "/admin/usuarios", icon: ShieldCheck, label: "Cuentas internas" },
  { to: "/admin/redes-sociales", icon: Share2, label: "Redes sociales" },
  { to: "/admin/resenas", icon: Star, label: "Reseñas" },
];

const navItemsSecretary = [
  { to: "/admin", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/admin/ds160", icon: ClipboardList, label: "Solicitudes DS-160" },
  { to: "/admin/resenas", icon: Star, label: "Reseñas" },
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { isAdmin, signOut, user } = useAuth();
  return (
    <div className="flex flex-col h-full bg-primary text-primary-foreground">
      <div className="p-5 border-b border-primary-foreground/10">
        <Link to="/admin" className="font-serif text-lg font-bold block">
          {isAdmin ? "Panel Admin" : "Panel Secretaría"}
        </Link>
        <p className="text-xs text-primary-foreground/60 truncate mt-1">
          {user?.email}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {(isAdmin ? navItemsAdmin : navItemsSecretary).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10",
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="p-3 border-t border-primary-foreground/10 space-y-1">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <Link to="/" onClick={onNavigate}>
            <Home className="w-4 h-4" /> Sitio público
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed top-0 left-0 h-screen w-64">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden fixed top-3 left-3 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="default" className="shadow-lg">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 min-w-0">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
