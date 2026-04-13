import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import { Activity } from "lucide-react";

export default function Index() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="h-8 w-8 animate-pulse-soft text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role === "admin" || role === "doctor") return <Navigate to="/admin" replace />;

  return <PatientDashboard />;
}
