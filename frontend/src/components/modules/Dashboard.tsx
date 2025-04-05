import React from 'react';
import CropDonutChart from '../visualizations/CropDonutChart';
import ModelProgressBar from '../visualizations/ModelProgressBar';
import PredictionTable from '../visualizations/PredictionTable';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export const Dashboard = () => {
  // Sample data for Top Recommended Crops
  const cropData = [
    { name: 'Wheat', value: 28, percentage: 28 },
    { name: 'Rice', value: 22, percentage: 22 },
    { name: 'Cotton', value: 18, percentage: 18 },
    { name: 'Maize', value: 15, percentage: 15 },
    { name: 'Others', value: 17, percentage: 17 },
  ];

  // Sample data for Model Performance
  const modelData = [
    { name: 'Random Forest', accuracy: 94 },
    { name: 'XGBoost', accuracy: 91 },
  ];

  // Sample data for Recent Predictions
  const predictionData = [
    { date: 'Mar 1, 2025', crop: 'Wheat', model: 'Random Forest', match: 92 },
    { date: 'Mar 1, 2025', crop: 'Rice', model: 'XGBoost', match: 88 },
    { date: 'Mar 3, 2025', crop: 'Cotton', model: 'Random Forest', match: 95 },
    { date: 'Mar 5, 2025', crop: 'Maize', model: 'Random Forest', match: 89 },
    { date: 'Mar 8, 2025', crop: 'Barley', model: 'XGBoost', match: 91 },
  ];

  // Tooltips for metrics
  const metricTooltips = {
    totalPredictions: "Total number of crop predictions made in your account",
    trainedModels: "Number of machine learning models currently trained and active",
    avgAccuracy: "Average prediction accuracy across all models",
    modelPerformance: {
      "Random Forest": "A robust ensemble learning method for prediction based on multiple decision trees",
      "XGBoost": "Advanced implementation of gradient boosted decision trees designed for speed and performance"
    },
    tableColumns: {
      date: "Date when the prediction was made",
      crop: "Predicted crop type",
      model: "Machine learning model used for prediction",
      match: "Confidence score of the prediction"
    }
  };
  
  return (
    <div className="bg-gray-50 dark:bg-[#0c0c0c] text-gray-900 dark:text-white min-h-screen my-8 mt-10 mb-15">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your predictions and model performance</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button className="px-4 py-2 rounded-md bg-green-500 text-white flex items-center hover:bg-green-600 transition-colors">
              <span className="mr-2">+</span> New Prediction
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Tippy content={metricTooltips.totalPredictions}>
            <div className="bg-white dark:bg-[#111111] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-400">Total Predictions</span>
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">47</div>
              
      </div>
          </Tippy>

          <Tippy content={metricTooltips.trainedModels}>
            <div className="bg-white dark:bg-[#111111] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-400">Trained Models</span>
                <svg className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="flex items-center mt-2 text-sm">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">5</div>
              </div>
            </div>
          </Tippy>

          <Tippy content={metricTooltips.avgAccuracy}>
            <div className="bg-white dark:bg-[#111111] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-400">Avg. Accuracy</span>
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">92.4%</div>
              
            </div>
          </Tippy>
      </div>
      
        {/* Main content - Modified layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left column - Recent Predictions + Model Performance */}
        <div className="lg:col-span-2">
          {/* Recent Predictions */}
            <div className="bg-white dark:bg-[#111111] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Predictions</h2>
              <PredictionTable 
                data={predictionData} 
                tooltips={metricTooltips.tableColumns}
              />
            <div className="mt-4 text-center">
                <a href="#" className="text-green-500 hover:text-green-400 hover:underline text-sm flex items-center justify-center">
                View All Predictions
                  <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                </a>
              </div>
            </div>
          
          {/* Model Performance */}
            <div className="bg-white dark:bg-[#111111] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Model Performance</h2>
              <ModelProgressBar 
                data={modelData} 
                tooltips={metricTooltips.modelPerformance}
              />
            </div>
        </div>
        
          {/* Right column - Top Recommended Crops */}
        <div>
            <div className="bg-white dark:bg-[#111111] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Recommended Crops</h2>
              <CropDonutChart data={cropData} />
                    </div>
                  </div>
                </div>

        {/* Quick Actions - Updated layout */}
        <div className="bg-[#111111] rounded-lg p-6 ">
          <h2 className="text-lg font-semibold mb-4 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Prediction button */}
            <button className="py-4 px-6 rounded-lg bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center transition-colors">
              <span className="bg-green-500/10 p-2 rounded-lg mr-3">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
              </span>
              <span className="text-white font-medium">New Prediction</span>
            </button>
            
            {/* Train New Model button */}
            <button className="py-4 px-6 rounded-lg bg-[#1a1a1a] hover:bg-[#222] flex items-center justify-center transition-colors">
              <span className="bg-blue-500/10 p-2 rounded-lg mr-3">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
              </span>
              <span className="text-white font-medium">Train New Model</span>
              </button>
              
            
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;