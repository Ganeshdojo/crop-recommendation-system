// src/components/visualizations/ModelProgressBar.tsx
import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface ModelData {
  name: string;
  accuracy: number;
}

interface ModelProgressBarProps {
  data: ModelData[];
  tooltips?: Record<string, string>;
}

const ModelProgressBar: React.FC<ModelProgressBarProps> = ({ 
  data, 
  tooltips = {} 
}) => {
  return (
    <div className="space-y-6">
      {data.map((model) => (
        <div key={model.name} className="mb-2">
          <div className="flex justify-between mb-1">
            <Tippy 
              content={tooltips[model.name] || `${model.name} model performance`}
              placement="top"
            >
              <span className="text-sm text-gray-700 dark:text-gray-400">{model.name}</span>
            </Tippy>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{model.accuracy}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${model.accuracy >= 90 ? 'bg-green-600 dark:bg-green-500' : 'bg-yellow-600 dark:bg-yellow-500'}`}
              style={{ width: `${model.accuracy}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModelProgressBar;