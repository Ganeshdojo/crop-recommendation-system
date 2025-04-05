// src/components/visualizations/CropDonutChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const COLORS = ['#4ade80', '#38bdf8', '#22d3ee', '#eab308', '#a78bfa'];

interface CropData {
  name: string;
  value: number;
  percentage: number;
}

interface CropDonutChartProps {
  data: CropData[];
  showLegend?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 rounded-md border border-gray-700 shadow-md">
        <p className="text-white font-medium">{`${payload[0].name}: ${payload[0].payload.percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const CropDonutChart: React.FC<CropDonutChartProps> = ({ 
  data, 
  showLegend = true
}) => {
  return (
    <div className="w-full">
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {showLegend && (
        <div className="mt-6 space-y-3">
          {data.map((crop, index) => (
            <div key={crop.name} className="flex items-center py-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-700 dark:text-gray-400">{crop.name}</span>
              <span className="ml-auto font-medium text-gray-900 dark:text-white">{crop.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropDonutChart;