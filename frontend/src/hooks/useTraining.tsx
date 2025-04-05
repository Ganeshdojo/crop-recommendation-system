import { useState } from "react";
import axios from "axios";
import { endpoints } from "../services/api";

export type TrainingAlgorithm = 'randomForest' | 'xgboost';

interface TrainingStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

interface TrainingProgress {
  overallProgress: number;
  steps: TrainingStep[];
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface ModelMetrics {
  success: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  feature_importance: FeatureImportance[];
}

interface TrainingMetrics {
  success: boolean;
  model_path: string;
  message: string;
  metrics: ModelMetrics;
}

interface TrainingResult {
  name: string;
  algorithm: string;
  metrics: TrainingMetrics;
  created_at: string;
}

export const useTraining = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [result, setResult] = useState<TrainingResult | null>(null);
  
  const initialProgress: TrainingProgress = {
    overallProgress: 0,
    steps: [
      { name: 'Dataset Preprocessing', status: 'pending', progress: 0 },
      { name: 'Feature Selection', status: 'pending', progress: 0 },
      { name: 'Model Training', status: 'pending', progress: 0 },
      { name: 'Cross Validation', status: 'pending', progress: 0 },
      { name: 'Model Evaluation', status: 'pending', progress: 0 }
    ]
  };
  
  const trainModel = async (algorithm: TrainingAlgorithm, datasetId: string) => {
    if (!algorithm || !datasetId) {
      setError("Please select an algorithm and upload a dataset before training.");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(initialProgress);
    setResult(null);
    
    try {
      console.log(`Training model with algorithm ${algorithm} and dataset ID ${datasetId}`);
      
      // Start training
      const trainingResponse = await endpoints.training.trainModel({
        dataset_id: datasetId,
        algorithm: algorithm
      });
      
      console.log("Training response:", trainingResponse.data);
      
      // Check for immediate errors in response
      if (trainingResponse.data.error) {
        throw new Error(trainingResponse.data.error);
      }

      // If training is already complete (synchronous training)
      if (trainingResponse.data.metrics?.metrics?.success) {
        setResult(trainingResponse.data);
        setLoading(false);
        // Update progress to complete
        setProgress({
          steps: initialProgress.steps.map(step => ({
            ...step,
            status: 'completed',
            progress: 100
          })),
          overallProgress: 100
        });
        return;
      }

      // Get the model ID from the response
      const modelId = trainingResponse.data.name;
      if (!modelId) {
        throw new Error("No model name received from training endpoint");
      }
      
      // Update initial progress
      setProgress(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[0].status = 'in-progress';
        updatedSteps[0].progress = 25;
        return {
          steps: updatedSteps,
          overallProgress: 5
        };
      });

      // Poll for training status
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 30; // 1 minute with 2-second intervals

      while (!isComplete && attempts < maxAttempts) {
        try {
          const statusResponse = await endpoints.training.getStatus(modelId);
          const status = statusResponse.data;

          if (status.metrics?.success || status.status === 'completed') {
            isComplete = true;
            const result: TrainingResult = {
              name: status.name,
              algorithm: status.algorithm,
              metrics: {
                success: status.metrics?.success || trainingResponse.data.metrics?.metrics?.success,
                model_path: status.model_path || trainingResponse.data.metrics?.model_path || "",
                message: status.message || trainingResponse.data.metrics?.message || "",
                metrics: {
                  success: status.metrics?.success || trainingResponse.data.metrics?.metrics?.success,
                  accuracy: status.metrics?.accuracy || trainingResponse.data.metrics?.metrics?.accuracy || 0,
                  precision: status.metrics?.precision || trainingResponse.data.metrics?.metrics?.precision || 0,
                  recall: status.metrics?.recall || trainingResponse.data.metrics?.metrics?.recall || 0,
                  f1_score: status.metrics?.f1_score || trainingResponse.data.metrics?.metrics?.f1_score || 0,
                  feature_importance: status.metrics?.feature_importance || trainingResponse.data.metrics?.metrics?.feature_importance || []
                }
              },
              created_at: status.created_at || trainingResponse.data.created_at || new Date().toISOString()
            };
            setResult(result);
            setLoading(false);
            // Update progress to complete
            setProgress({
              steps: initialProgress.steps.map(step => ({
                ...step,
                status: 'completed',
                progress: 100
              })),
              overallProgress: 100
            });
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Training failed');
          } else {
            // Update progress
            if (status.progress) {
              setProgress(prev => {
                if (!prev) return null;
                return {
                  steps: status.progress.steps || prev.steps,
                  overallProgress: status.progress.overall || prev.overallProgress
                };
              });
            }
          }
        } catch (err) {
          console.error('Error checking training status:', err);
          attempts++;
        }

        if (!isComplete) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }

      if (!isComplete) {
        throw new Error('Training timed out. Please try again.');
      }

    } catch (err: any) {
      console.error("Training API error:", err);
      setError(err.response?.data?.error || err.message || "An error occurred during training");
      setLoading(false);
    }
  };
  
  const processTrainingResult = (apiResult: any, algorithm: TrainingAlgorithm) => {
    // Process and format the API result
    const formattedResult: TrainingResult = {
      name: apiResult.name,
      algorithm: apiResult.algorithm,
      metrics: {
        success: apiResult.metrics.success,
        model_path: apiResult.metrics.model_path,
        message: apiResult.metrics.message,
        metrics: {
          success: apiResult.metrics.success,
          accuracy: apiResult.metrics.accuracy,
          precision: apiResult.metrics.precision,
          recall: apiResult.metrics.recall,
          f1_score: apiResult.metrics.f1_score,
          feature_importance: apiResult.metrics.feature_importance
        }
      },
      created_at: apiResult.created_at
    };
    
    setResult(formattedResult);
    setLoading(false);
  };
  
  const fallbackToMockResult = (algorithm: TrainingAlgorithm) => {
    console.log("Falling back to mock training result");
    
    // Complete the progress simulation
    finalizeProgressSimulation();
    
    // Set mock result
    setResult({
      name: algorithm,
      algorithm,
      metrics: {
        success: true,
        model_path: "",
        message: "",
        metrics: {
          success: true,
          accuracy: algorithm === 'randomForest' ? 0.938 : 0.942,
          precision: algorithm === 'randomForest' ? 0.94 : 0.95,
          recall: algorithm === 'randomForest' ? 0.91 : 0.92,
          f1_score: algorithm === 'randomForest' ? 0.92 : 0.93,
          feature_importance: [
            { feature: "nitrogen", importance: 0.25 },
            { feature: "rainfall", importance: 0.20 },
            { feature: "temperature", importance: 0.18 },
            { feature: "potassium", importance: 0.15 },
            { feature: "phosphorus", importance: 0.12 },
            { feature: "humidity", importance: 0.07 },
            { feature: "ph", importance: 0.03 }
          ]
        }
      },
      created_at: new Date().toISOString()
    });
    
    setLoading(false);
  };
  
  // Function to simulate progress updates for visual feedback
  const simulateProgressUpdate = async () => {
    return new Promise<void>(resolve => {
      setProgress(prev => {
        if (!prev) return null;
        
        const updatedSteps = [...prev.steps];
        let overallProgress = 0;
        
        // Find the current active step
        let activeStepIndex = 0;
        for (let i = 0; i < updatedSteps.length; i++) {
          if (updatedSteps[i].status === 'in-progress' || updatedSteps[i].status === 'pending') {
            activeStepIndex = i;
            break;
          }
        }
        
        // Update the active step
        const activeStep = updatedSteps[activeStepIndex];
        if (activeStep.status === 'pending') {
          activeStep.status = 'in-progress';
        }
        
        if (activeStep.status === 'in-progress') {
          activeStep.progress += Math.floor(Math.random() * 15) + 5; // Random increment
          
          if (activeStep.progress >= 100) {
            activeStep.progress = 100;
            activeStep.status = 'completed';
            
            // Move to next step if available
            if (activeStepIndex < updatedSteps.length - 1) {
              updatedSteps[activeStepIndex + 1].status = 'in-progress';
            }
          }
        }
        
        // Calculate overall progress
        let completedSteps = 0;
        let totalProgress = 0;
        updatedSteps.forEach(step => {
          if (step.status === 'completed') {
            completedSteps++;
            totalProgress += 100;
          } else if (step.status === 'in-progress') {
            totalProgress += step.progress;
          }
        });
        
        overallProgress = Math.floor(totalProgress / updatedSteps.length);
        
        return {
          steps: updatedSteps,
          overallProgress
        };
      });
      
      setTimeout(resolve, 500); // Small delay for smoother animation
    });
  };
  
  // Function to finalize progress simulation
  const finalizeProgressSimulation = () => {
        setProgress(prev => {
      if (!prev) return null;
      
      const updatedSteps = prev.steps.map(step => ({
        ...step,
        status: 'completed' as const,
        progress: 100
      }));
      
      return {
        steps: updatedSteps,
        overallProgress: 100
      };
    });
  };
  
  const clearResult = () => {
    setResult(null);
    setProgress(null);
  };
  
  return {
    trainModel,
    loading,
    error,
    progress,
    result,
    clearResult
  };
};