import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScanGoEntry from "./components/ScanGoEntry";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlackFireCursor from "./components/BlackFireCursor";

const queryClient = new QueryClient();

// Inner component that uses useLocation - must be inside BrowserRouter
const AppRoutes = () => {
  const location = useLocation();
  const showCursor = location.pathname !== "/";

  return (
    <>
      {showCursor && <BlackFireCursor />}
      <Routes>
        <Route path="/" element={<ScanGoEntry />} />
        <Route path="/dashboard" element={<Index />} />
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

