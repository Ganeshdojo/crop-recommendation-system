import { Navbar } from "../components/layout/Navbar";
import { Results } from "../components/modules/Results";

export const ResultsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Results />
    </div>
  );
};