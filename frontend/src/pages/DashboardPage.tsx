import { Navbar } from "../components/layout/Navbar";
import { Dashboard } from "../components/modules/Dashboard";

export const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Dashboard />
    </div>
  );
};