import AuthGate from "@/components/AuthGate";
import Dashboard from "@/components/Dashboard";

export default function ProtectedDashboard() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
