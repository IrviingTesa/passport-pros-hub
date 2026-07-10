import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
//import DS160Form from "./pages/DS160Form.tsx";
import TerminosCondiciones from "./pages/TerminosCondiciones.tsx";
import AvisoPrivacidad from "./pages/AvisoPrivacidad.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import ServicesAdmin from "./pages/admin/ServicesAdmin.tsx";

import UsersAdmin from "./pages/admin/UsersAdmin.tsx";
import SocialMediaAdmin from "./pages/admin/SocialMediaAdmin.tsx";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin.tsx";
import DS160Admin from "./pages/admin/DS160Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SiteSettingsProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* <Route path="/ds160" element={<DS160Form />} /> */}
            <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
            <Route path="/aviso-de-privacidad" element={<AvisoPrivacidad />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRoles={["admin", "secretary"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="categorias" element={<Navigate to="/admin/servicios" replace />} />
              <Route path="servicios" element={<ServicesAdmin />} />
              <Route path="personal" element={<Navigate to="/admin/usuarios" replace />} />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute requireRoles={["admin"]}>
                    <UsersAdmin />
                  </ProtectedRoute>
                }
              />
              <Route path="redes-sociales" element={<SocialMediaAdmin />} />
              <Route path="videos" element={<SocialMediaAdmin />} />
              <Route path="resenas" element={<ReviewsAdmin />} />
              <Route path="ds160" element={<DS160Admin />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
