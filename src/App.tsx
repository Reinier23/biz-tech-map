import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Mapper from "./pages/Mapper";
import AddTools from "./pages/AddTools";
import TechMap from "./pages/TechMap";
import UnifiedTechMap from "./pages/UnifiedTechMap";
import ConsolidationSuggestions from "./pages/ConsolidationSuggestions";
import GenerateMap from "./pages/GenerateMap";
import QACheck from "./pages/QACheck";
import NotFound from "./pages/NotFound";
import { ToolsProvider } from "./contexts/ToolsContext";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToolsProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/mapper" element={<Mapper />} />
                <Route path="/add-tools" element={<AddTools />} />
                <Route path="/tech-map" element={<TechMap />} />
                <Route path="/legacy-tech-map" element={<UnifiedTechMap />} />
                <Route path="/consolidation" element={<ConsolidationSuggestions />} />
                <Route path="/generate-map" element={<GenerateMap />} />
                <Route path="/qa-check" element={<QACheck />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </TooltipProvider>
        </ToolsProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
