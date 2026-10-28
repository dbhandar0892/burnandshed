import ResetPassword from "./pages/ResetPassword";
import { NativeAuthBridge, NativeAuthStart } from "./pages/NativeAuth";
import { Toaster as Sonner } from "@/components/ui/sonner";
// TooltipProvider removed to avoid runtime issue; Radix tooltips work without global provider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Privacy, Terms } from "./pages/Legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/native" element={<NativeAuthStart />} />
        <Route path="/auth/native-bridge" element={<NativeAuthBridge />} />
        <Route path="/terms" element={<Terms />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
