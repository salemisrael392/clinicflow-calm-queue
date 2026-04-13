import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Activity } from "lucide-react";

import Auth from "./pages/Auth";
import Index from "./pages/Index";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import QueueStatus from "./pages/patient/QueueStatus";
import QueueBoard from "./pages/QueueBoard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManageSchedules from "./pages/admin/ManageSchedules";
import QueueControl from "./pages/admin/QueueControl";
import AllAppointments from "./pages/admin/AllAppointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Activity className="h-8 w-8 animate-pulse-soft text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Activity className="h-8 w-8 animate-pulse-soft text-primary" />
    </div>
  );
  if (role !== "admin" && role !== "doctor") return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/queue-board" element={<QueueBoard />} />

            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
            <Route path="/queue" element={<ProtectedRoute><QueueStatus /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute><AdminRoute><ManageDoctors /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/schedules" element={<ProtectedRoute><AdminRoute><ManageSchedules /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/queue" element={<ProtectedRoute><AdminRoute><QueueControl /></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute><AdminRoute><AllAppointments /></AdminRoute></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
