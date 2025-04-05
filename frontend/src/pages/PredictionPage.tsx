import { Navbar } from "../components/layout/Navbar";
import { Prediction } from "../components/modules/Prediction";

export const PredictionPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Prediction />
    </div>
  );
};