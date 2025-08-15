import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Mapper from "./pages/Mapper";
import AddTools from "./pages/AddTools";
import TechMap from "./pages/TechMap";
import UnifiedTechMap from "./pages/UnifiedTechMap";
import Consolidation from "./pages/Consolidation";
import GenerateMap from "./pages/GenerateMap";
import QACheck from "./pages/QACheck";
import QA from "./pages/QA";
import NotFound from "./pages/NotFound";
import { ToolsProvider } from "./contexts/ToolsContext";
import { HelmetProvider } from "react-helmet-async";
import Share from "./pages/Share";
import Settings from "./pages/Settings";
import Audit from "./pages/Audit";
import FixRunner from "./pages/FixRunner";
import { AuthProvider } from "./contexts/AuthContext";
import AuthModal from "./components/AuthModal";
import HeaderBar from "./components/HeaderBar";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToolsProvider>
            <TooltipProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
                  <HeaderBar />
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/mapper" element={<Mapper />} />
                      <Route path="/add-tools" element={<AddTools />} />
                      <Route path="/tech-map" element={<TechMap />} />
                      <Route path="/legacy-tech-map" element={<UnifiedTechMap />} />
                      <Route path="/consolidation" element={<Consolidation />} />
                      <Route path="/generate-map" element={<GenerateMap />} />
                      <Route path="/qa-check" element={<QACheck />} />
                      <Route path="/qa" element={<QA />} />
                      <Route path="/share/:id" element={<Share />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
                      <Route path="/fix-runner" element={<FixRunner />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                  <Toaster />
                  <Sonner />
                  <AuthModal />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </ToolsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
