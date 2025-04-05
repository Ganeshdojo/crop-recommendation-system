import {
  useState,
  useRef,
  ChangeEvent,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useTraining } from "../../hooks/useTraining";
import { DataVisualizer } from "../ui/DataVisualizer";
import { endpoints } from "../../services/api";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// API URL for FormData uploads
const API_URL = "http://localhost:8000/api";

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

type TrainingAlgorithm = "randomForest" | "xgboost";

interface TrainingProgress {
  current: number;
  total: number;
  message: string;
}

interface TrainingHookResult {
  trainModel: (algorithm: TrainingAlgorithm, datasetId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  progress: TrainingProgress | null;
  result: TrainingResult | null;
  clearResult: () => void;
}

// Debounce helper
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface TrainingMetricsCardProps {
  title: string;
  value: string | number | null;
  description: string;
}

const TrainingMetricsCard = ({ title, value, description }: TrainingMetricsCardProps) => {
  // Handle null, undefined, or NaN values
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (Number.isNaN(numericValue)) {
      return '0.00';
    }
    
    if (title.toLowerCase() === 'accuracy') {
      // Convert decimal to percentage (e.g., 0.9788 to 97.88%)
      return `${(numericValue * 100).toFixed(2)}%`;
    }
    
    // Display other metrics as decimals with 2 places (e.g., 0.97)
    return numericValue.toFixed(2);
  };

  return (
    <div className="bg-white/5 dark:bg-[#2f2e2a] backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <div className="text-3xl font-bold mb-2 text-green-500">
        {displayValue()}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

export const Training = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[] | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<TrainingAlgorithm | null>(null);
  const { trainModel, progress, result, loading, clearResult } = useTraining();
  const [uploading, setUploading] = useState(false);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce
  const navigate = useNavigate();

  // Add type assertion for result
  const typedResult = result as TrainingResult | null;

  // Add detailed console logging
  useEffect(() => {
    if (typedResult) {
      console.log('Raw Training Result:', JSON.stringify(typedResult, null, 2));
      console.log('Metrics Structure:', {
        hasMetrics: !!typedResult.metrics,
        metricsKeys: typedResult.metrics ? Object.keys(typedResult.metrics) : [],
        fullMetrics: typedResult.metrics
      });
    }
  }, [typedResult]);

  // Update metric access
  const getMetricValue = (result: TrainingResult | null, key: 'accuracy' | 'precision' | 'recall' | 'f1_score'): string | number | null => {
    try {
      if (!result?.metrics?.metrics) return null;
      return result.metrics.metrics[key];
    } catch (e) {
      console.error('Error accessing metric:', key, e);
      return null;
    }
  };

  const getFeatureImportance = (result: TrainingResult | null): FeatureImportance[] => {
    try {
      return result?.metrics?.metrics?.feature_importance || [];
    } catch (e) {
      console.error('Error accessing feature importance:', e);
      return [];
    }
  };

  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (!previewData) return null;
    if (!debouncedSearchQuery) return previewData;

    const query = debouncedSearchQuery.toLowerCase();
    return previewData.filter((row) => {
      // Convert row values to array and search only once
      const values = Object.values(row);
      return values.some((value) =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [previewData, debouncedSearchQuery]);

  // Optimize search handler to only update search query
  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append("dataset", file);

    try {
      setUploading(true);
      console.log("Uploading dataset to backend API...");

      // Upload to backend first
      const response = await axios.post(
        `${API_URL}/datasets/upload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Dataset upload response:", response.data);

      if (!response.data || !response.data.file_path || !response.data.dataset_id) {
        throw new Error("Server did not return required dataset information");
      }

      // Store both the file path and dataset ID
      setDatasetId(response.data.dataset_id);
      console.log(
        "Dataset uploaded successfully with ID:",
        response.data.dataset_id,
        "and path:",
        response.data.file_path
      );

      // Now read the file for preview
      const fileContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsText(file);
      });

      // Parse CSV content
      const lines = fileContent.split("\n");
      const headers = lines[0].split(",").map((header) => header.trim());
      const previewRows: Record<string, string>[] = [];

      // Parse all rows for preview
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",");
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || "";
          });
          previewRows.push(row);
        }
      }

      // Set preview data with actual content
      setPreviewData(previewRows);
      console.log("Preview data created from server response");
      setShowPreviewModal(true);
    } catch (err: any) {
      console.error("Error uploading dataset:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to upload dataset to server. Please try again.";
      alert(errorMessage);
      setDatasetId(null);
      setShowPreviewModal(false);
    } finally {
      setUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleTrainModel = () => {
    if (!selectedAlgorithm) {
      alert("Please select an algorithm before training");
      return;
    }
    if (!datasetId) {
      alert("Please upload a dataset before training");
      return;
    }

    console.log(
      `Starting model training with algorithm: ${selectedAlgorithm} and dataset ID: ${datasetId}`
    );
    
    try {
      trainModel(selectedAlgorithm, datasetId);
    } catch (err) {
      console.error("Error starting model training:", err);
      alert("Failed to start model training. Please try again.");
    }
  };

  const handleAlgorithmSelect = (algorithm: TrainingAlgorithm) => {
    setSelectedAlgorithm(algorithm);
    clearResult(); // Clear any previous training results
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Train Your Model</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create and customize machine learning models for accurate crop
          predictions
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Upload Dataset */}
        <motion.div variants={fadeInUp}>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Upload Dataset</h2>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
                  selectedFile
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
                }`}
                onClick={handleBrowseClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <svg
                          className="h-8 w-8 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </motion.div>
                      <p className="font-medium text-lg mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB •{" "}
                        {selectedFile.type || "CSV file"}
                      </p>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPreviewModal(true);
                          }}
                        >
                          Preview Dataset
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload-prompt"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <svg
                          className="h-8 w-8 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </motion.div>
                      <p className="font-medium text-lg mb-1">
                        Drag and drop your CSV file here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supported formats: CSV, XLS, XLSX (Max size: 10MB)
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
              />
            </div>
          </Card>
        </motion.div>

        {/* Select Algorithm */}
        <motion.div variants={fadeInUp}>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Select Algorithm</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Random Forest */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedAlgorithm === "randomForest"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-md"
                  }`}
                  onClick={() => handleAlgorithmSelect("randomForest")}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        selectedAlgorithm === "randomForest"
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v7a4 4 0 0 0 4 4h12"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 11v9"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 11v9"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 15v5"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 11v9"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 15v5"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Random Forest</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ensemble learning method
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    An ensemble of decision trees that improves prediction
                    accuracy and controls overfitting.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">
                        High accuracy for most of the datasets
                      </span>
                    </div>
                    <div className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">
                        Handles data with missing values
                      </span>
                    </div>
                    <div className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">
                        Ideal for complex crop-soil relationships
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* XGBoost */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedAlgorithm === "xgboost"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-md"
                  }`}
                  onClick={() => handleAlgorithmSelect("xgboost")}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        selectedAlgorithm === "xgboost"
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">XGBoost</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Gradient boosting framework
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    A powerful algorithm that sequentially builds models to
                    correct errors from previous iterations.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">
                        Superior performance on structured data
                      </span>
                    </div>
                    <div className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">speed & efficiency</span>
                    </div>
                    <div className="flex items-start">
                      <svg
                        className="h-4 w-4 text-green-500 mr-2 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">
                        Excellent for complex agricultural predictions
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeInUp} className="flex justify-end space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setSelectedAlgorithm(null);
                clearResult();
              }}
              disabled={!selectedFile && !selectedAlgorithm}
              className="transition-all duration-300"
            >
              Reset
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleTrainModel}
              disabled={!selectedAlgorithm || !selectedFile || loading}
              className="transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Training...
                </div>
              ) : (
                "Train Model"
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Training Progress */}
        <AnimatePresence>
          {loading && progress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 mb-6 w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
                    <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-primary animate-pulse"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <span className="text-2xl font-bold text-foreground/90 dark:text-foreground/90 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                      Training in Progress
                    </span>
                    <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                      Please wait while we process your dataset. This may take a
                      few minutes depending on the size and complexity of your
                      data. We're optimizing the model for your agricultural
                      predictions.
                    </p>
                  </div>
                  <div className="w-full max-w-lg">
                    <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse"></div>
                    </div>
                    <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <svg
                        className="h-4 w-4 animate-bounce"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span>Processing your agricultural dataset...</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Training Results */}
        <AnimatePresence>
          {typedResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <Card>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Training Results</h2>
                      <p className="text-sm text-gray-500">
                        Algorithm: {typedResult.algorithm === 'random_forest' ? 'Random Forest' : 'XGBoost'}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/prediction')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Go to Prediction Page
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <TrainingMetricsCard
                      title="Accuracy"
                      value={getMetricValue(typedResult, 'accuracy')}
                      description="The percentage of correct predictions out of all predictions made by the model."
                    />
                    <TrainingMetricsCard
                      title="Precision"
                      value={getMetricValue(typedResult, 'precision')}
                      description="The ratio of correctly predicted positive observations to the total predicted positives."
                    />
                    <TrainingMetricsCard
                      title="Recall"
                      value={getMetricValue(typedResult, 'recall')}
                      description="The ratio of correctly predicted positive observations to all observations in the actual class."
                    />
                    <TrainingMetricsCard
                      title="F1 Score"
                      value={getMetricValue(typedResult, 'f1_score')}
                      description="The weighted average of Precision and Recall, providing a balance between the two metrics."
                    />
                  </div>

                  {getFeatureImportance(typedResult).length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Feature Importance</h3>
                      <div className="bg-gray-100 dark:bg-[#2f2e2a] p-4 rounded-lg">
                        {[...getFeatureImportance(typedResult)]
                          .sort((a, b) => b.importance - a.importance)
                          .map((feature, index) => (
                            <div key={index} className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">{feature.feature}</span>
                                <span className="text-green-600 dark:text-green-500">
                                  {(feature.importance *  100).toFixed(2)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-[#55534c] rounded-full h-2">
                                <div
                                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                                  style={{ width: `${feature.importance * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dataset Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewData && previewData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#171310] rounded-lg w-[90%] max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold">Dataset Preview</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search in dataset..."
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-[#171310] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {filteredData
                    ? `Showing ${filteredData.length} of ${previewData.length} rows`
                    : `Showing ${previewData.length} rows`}
                </div>
              </div>

              <div className="overflow-auto p-4 max-h-[calc(90vh-12rem)]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-[#0f0c0a] sticky top-0">
                    <tr>
                      {previewData &&
                        previewData[0] &&
                        Object.keys(previewData[0]).map((header, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#0f0c0a] divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredData &&
                      filteredData.slice(0, 100).map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={
                            rowIdx % 2 === 0
                              ? "bg-gray-50 dark:bg-[#171310]"
                              : ""
                          }
                        >
                          {Object.values(row).map((value, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200"
                            >
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
                {filteredData && filteredData.length > 100 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Showing first 100 rows of {filteredData.length} matches
                  </div>
                )}
                {filteredData?.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No matching results found
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-2 border-t dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredData && previewData
                    ? `Showing ${Math.min(filteredData.length, 100)} of ${
                        filteredData.length
                      } matches (${previewData.length} total rows)`
                    : ""}
                </div>
                <Button onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
