import { ReactNode } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Radar, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = "line" | "bar" | "radar" | "pie";

interface DataVisualizerProps {
  type: ChartType;
  data: any;
  options?: any;
  className?: string;
  fallback?: ReactNode;
}

export const DataVisualizer = ({
  type,
  data,
  options = {},
  className = "",
  fallback = null,
}: DataVisualizerProps) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  if (!data) return <>{fallback}</>;
  
  const chartComponents = {
    line: Line,
    bar: Bar,
    radar: Radar,
    pie: Pie,
  };
  
  const ChartComponent = chartComponents[type];
  
  return (
    <div className={`h-64 ${className}`}>
      <ChartComponent data={data} options={mergedOptions} />
    </div>
  );
};
