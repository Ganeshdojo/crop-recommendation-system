import { useState } from "react";
import { endpoints } from "../services/api";

type SoilParameters = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
};

type EnvironmentalParameters = {
  temperature: number;
  rainfall: number;
  humidity: number;
};

type PredictionResult = {
  top_crop: {
    crop: string;
    confidence: number;
  };
  crop_matches: Array<{
    crop: string;
    confidence: number;
  }>;
  match_analysis: {
    overall_match: number;
    parameters: Array<{
      name: string;
      match: number;
      value: number;
      unit: string;
    }>;
  };
  growing_conditions: Array<{
    name: string;
    value: string;
    icon: string;
  }>;
  recommendations: string[];
  timeline: Array<{
    stage: string;
    duration: string;
    description: string;
  }>;
  weather_forecast: Array<{
    day: string;
    date: string;
    temp: number;
    condition: string;
    humidity: number;
    icon: string;
  }>;
  alternative_crops: Array<{
    name: string;
    match: number;
  }>;
  crop_info: {
    image: string;
    growingConditions: {
      Temperature: string;
      Rainfall: string;
      "Growth Period": string;
      "Optimal pH": string;
    };
    soilRequirements: {
      nitrogen: string;
      phosphorus: string;
      potassium: string;
      ph: string;
    };
    description: string;
  };
};

export const usePrediction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predictCrop = async (
    soilParams: SoilParameters,
    envParams: EnvironmentalParameters
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format data for API
      const requestData = {
        N: soilParams.nitrogen,
        P: soilParams.phosphorus,
        K: soilParams.potassium,
        pH: soilParams.ph,
        temperature: envParams.temperature,
        rainfall: envParams.rainfall,
        humidity: envParams.humidity
      };

      // Make API call
      const response = await endpoints.prediction.predict(requestData);
      const predictionResult = response.data;

      // No need to adjust confidence scores anymore as they come correctly from the backend
      setResult(predictionResult);
      return predictionResult;
    } catch (err: any) {
      console.error("Prediction API error:", err);
      const errorMessage = err.response?.data?.error || "Failed to make prediction";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearResult = () => {
    setResult(null);
  };
  
  return {
    isLoading,
    error,
    result,
    predictCrop,
    clearResult,
  };
};