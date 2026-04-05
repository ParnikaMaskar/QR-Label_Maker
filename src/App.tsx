import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScanGoEntry from "./components/ScanGoEntry";
import Index from "./pages/Index";
import QRMakerPage from "./pages/QRMakerPage";
import LabelMakerPage from "./pages/LabelMakerPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

// Inner component that uses useLocation - must be inside BrowserRouter
const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<ScanGoEntry />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/qr-maker" element={<QRMakerPage />} />
        <Route path="/label-maker" element={<LabelMakerPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

