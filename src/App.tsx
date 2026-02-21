import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import CartDrawer from "@/components/store/CartDrawer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import Index from "./pages/Index";
import LeBonCoinMockup from "./pages/LeBonCoinMockup";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card rounded-2xl p-8 text-center max-w-md mx-4"><h2 className="font-heading font-bold text-xl text-destructive mb-2">Accès Refusé</h2><p className="text-sm text-muted-foreground mb-4">Permissions administrateur requises.</p><a href="/" className="text-sm text-primary hover:underline">Retour à la boutique</a></div></div>;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <CustomCursor />
            <Toaster />
            <Sonner />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mockup" element={<LeBonCoinMockup />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
