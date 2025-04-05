import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  BeakerIcon,
  CloudIcon,
  ThermometerIcon,
  CloudRainIcon,
  DropletIcon,
  RefreshCcwIcon,
  Loader2Icon,
  Leaf as LeafIcon,
} from "lucide-react";
import { endpoints } from "../../services/api";
import { usePrediction } from '@/hooks/usePrediction';
// You may also need to create/import a LeafIcon for the prediction button

type SoilParameter = {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimal: string;
  icon: React.ReactNode;
};

type EnvironmentalParameter = {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  levels: string[];
  icon: React.ReactNode;
};

// Type for ParameterRow props
interface ParameterRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min: number;
  max: number;
  step?: number;
  optimalText?: string;
}

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

// Updated ParameterRow with animations
const ParameterRow = ({
  icon,
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  optimalText,
}: ParameterRowProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    className="mb-6 
      bg-white dark:bg-[#171717] 
      p-4 rounded-lg 
      shadow-sm border dark:border-gray-800
      transition-all duration-300 hover:shadow-md"
  >
    <div className="flex items-center mb-2">
      <motion.div whileHover={{ rotate: 10 }} className="mr-2">
        {icon}
      </motion.div>
      <span className="font-medium text-gray-800 dark:text-gray-100">
        {label}
      </span>
      <motion.div className="ml-auto" whileHover={{ scale: 1.05 }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded text-center
                   transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <span className="ml-2 text-gray-600 dark:text-gray-300">{unit}</span>
      </motion.div>
    </div>
    <div className="mb-1 relative">
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-green-500"
        style={{
          width: `${((value - min) / (max - min)) * 100}%`,
          borderRadius: "9999px",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
        transition={{ duration: 0.3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-[#2a2a2a]
                 relative z-10 transition-all duration-200"
      />
    </div>
    {optimalText && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-gray-500 dark:text-gray-400 text-left mt-2"
      >
        {optimalText}
      </motion.p>
    )}
  </motion.div>
);

// Type for FormButtons props
interface FormButtonsProps {
  onReset: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

// Updated FormButtons with animations
const FormButtons = ({ onReset, onSubmit, isLoading }: FormButtonsProps) => (
  <motion.div className="flex justify-end gap-4 mt-8" variants={fadeInUp}>
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="flex items-center border border-gray-300 dark:border-0 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-all duration-200"
      >
        <motion.div
          animate={{ rotate: isLoading ? 360 : 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCcwIcon className="h-4 w-4 mr-2" />
        </motion.div>
        Reset Form
      </Button>
    </motion.div>
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        disabled={isLoading}
        className="flex items-center bg-green-500 hover:bg-green-600 text-white border-0
                 transition-all duration-200 relative overflow-hidden"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-2"
          >
            <Loader2Icon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="mr-2"
          >
            <LeafIcon className="h-4 w-4" />
          </motion.div>
        )}
        {isLoading ? "Generating Prediction..." : "Generate Crop Prediction"}
      </Button>
    </motion.div>
  </motion.div>
);

// Add these interfaces at the top of the file with other type definitions
interface GrowingCondition {
  name: string;
  value: string;
  icon?: string;
}

interface WeatherForecast {
  day: string;
  date: string;
  temp: number;
  condition: string;
  humidity: number;
  icon?: string;
}

// Add this as a constant at the top of your file, outside the component
const API_KEY = "1f68c36d6f9904008cc8e05cc7868a16";

export const Prediction = () => {
  const navigate = useNavigate();
  const { predictCrop } = usePrediction();
  const [useLocation, setUseLocation] = useState(false);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    city: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Soil parameters
  const [soilParams, setSoilParams] = useState<SoilParameter[]>([
    {
      name: "Nitrogen",
      value: 75,
      unit: "kg/ha",
      min: 0,
      max: 300,
      optimal: "Optimal level: 60-100 kg/ha for most crops",
      icon: (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
          N
        </span>
      ),
    },
    {
      name: "Phosphorus",
      value: 45,
      unit: "kg/ha",
      min: 0,
      max: 150,
      optimal: "Optimal level: 30-60 kg/ha for most crops",
      icon: (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
          P
        </span>
      ),
    },
    {
      name: "Potassium",
      value: 80,
      unit: "kg/ha",
      min: 0,
      max: 300,
      optimal: "Optimal level: 60-100 kg/ha for most crops",
      icon: (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
          K
        </span>
      ),
    },
    {
      name: "Soil pH",
      value: 6.5,
      unit: "",
      min: 0,
      max: 14,
      optimal: "Optimal level: 6.0-7.5 for most crops",
      icon: (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200">
          pH
        </span>
      ),
    },
  ]);

  // Environmental parameters
  const [envParams, setEnvParams] = useState<EnvironmentalParameter[]>([
    {
      name: "Average Temperature",
      value: 21,
      unit: "°C",
      min: -10,
      max: 50,
      levels: ["Cold", "Moderate", "Hot"],
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      name: "Annual Rainfall",
      value: 95,
      unit: "cm",
      min: 0,
      max: 300,
      levels: ["Low", "Medium", "High"],
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
    },
    {
      name: "Humidity",
      value: 65,
      unit: "%",
      min: 0,
      max: 100,
      levels: ["Dry", "Average", "Humid"],
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
    },
  ]);

  const handleSoilParamChange = (index: number, value: number) => {
    const updatedParams = [...soilParams];
    updatedParams[index].value = value;
    setSoilParams(updatedParams);
  };

  const handleEnvParamChange = (index: number, value: number) => {
    const updatedParams = [...envParams];
    updatedParams[index].value = value;
    setEnvParams(updatedParams);
  };

  // Add this function to fetch weather data
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      // Check if location is near Madanapalle (within ~10km radius)
      const madanapalleLatitude = 13.5517;
      const madanapalleLongitude = 78.4948;
      const distance = calculateDistance(
        latitude,
        longitude,
        madanapalleLatitude,
        madanapalleLongitude
      );

      // If within 10km of Madanapalle or if coordinates are exactly Madanapalle's
      if (distance <= 10 || (latitude === madanapalleLatitude && longitude === madanapalleLongitude)) {
        // Use hardcoded values for Madanapalle
        const updatedEnvParams = [...envParams];
        updatedEnvParams[0].value = 35; // Temperature
        updatedEnvParams[2].value = 16; // Humidity
        
        // Update rainfall based on location
        let estimatedAnnualRainfall = 70; // Typical for Madanapalle region
        updatedEnvParams[1].value = Math.min(Math.max(estimatedAnnualRainfall, updatedEnvParams[1].min), updatedEnvParams[1].max);

        setEnvParams(updatedEnvParams);
        return null;
      }

      // For other locations, fetch real weather data
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastURL);
      const forecastData = await forecastResponse.json();

      const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      const currentResponse = await fetch(currentWeatherURL);
      const currentData = await currentResponse.json();

      // Filter for unique forecast days and get afternoon temperatures (around 15:00)
      const today = new Date().getDate();
      const afternoonTemp = forecastData.list
        .filter((forecast: any) => {
          const forecastDate = new Date(forecast.dt_txt);
          return forecastDate.getDate() === today && forecastDate.getHours() >= 12 && forecastDate.getHours() <= 15;
        })
        .reduce((latest: any, forecast: any) => {
          if (!latest || Math.abs(new Date(forecast.dt_txt).getHours() - 15) < Math.abs(new Date(latest.dt_txt).getHours() - 15)) {
            return forecast;
          }
          return latest;
        }, null);

      // Update environmental parameters based on real data
      const updatedEnvParams = [...envParams];

      // Use afternoon temperature if available, otherwise use current temp
      const tempCelsius = Math.round(afternoonTemp ? afternoonTemp.main.temp : currentData.main.temp);
      updatedEnvParams[0].value = Math.min(Math.max(tempCelsius, updatedEnvParams[0].min), updatedEnvParams[0].max);

      // Use current humidity
      const humidity = currentData.main.humidity;
      updatedEnvParams[2].value = Math.min(Math.max(humidity, updatedEnvParams[2].min), updatedEnvParams[2].max);

      // Estimate annual rainfall based on climate zone
      let estimatedAnnualRainfall = 85;
      const lat = Math.abs(latitude);
      if (lat < 10) {
        estimatedAnnualRainfall = 180;
      } else if (lat < 20) {
        estimatedAnnualRainfall = 120;
      } else if (lat < 35) {
        estimatedAnnualRainfall = 70;
      } else if (lat < 55) {
        estimatedAnnualRainfall = 85;
      } else {
        estimatedAnnualRainfall = 40;
      }

      // Adjust based on current conditions
      if (
        currentData.weather[0].main === "Rain" ||
        currentData.weather[0].main === "Drizzle" ||
        currentData.weather[0].main === "Thunderstorm"
      ) {
        estimatedAnnualRainfall += 15;
      } else if (
        currentData.weather[0].main === "Clear" &&
        currentData.main.humidity < 40
      ) {
        estimatedAnnualRainfall -= 10;
      }

      updatedEnvParams[1].value = Math.min(Math.max(estimatedAnnualRainfall, updatedEnvParams[1].min), updatedEnvParams[1].max);

      setEnvParams(updatedEnvParams);
      return { currentData, forecastData: forecastData.list };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert(
        "Failed to fetch weather data. Please try again or enter values manually."
      );
      return null;
    }
  };

  // Helper function to calculate distance between coordinates (using Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const handleLocationToggle = () => {
    if (!useLocation) {
      // Get location when enabling
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Get city name using reverse geocoding
            const geocodeURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            const response = await fetch(geocodeURL);
            const data = await response.json();
            const cityName = data[0]?.name || "Unknown Location";

            setLocationData({
              lat: latitude,
              lng: longitude,
              city: cityName,
            });

            // Fetch and update weather data
            await fetchWeatherData(latitude, longitude);
          } catch (error) {
            console.error("Error getting location data:", error);
            alert(
              "Could not get location data. Please enable location access or enter values manually."
            );
            setUseLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Could not get your location. Please enable location access or enter values manually."
          );
          setUseLocation(false);
        }
      );
    }
    setUseLocation(!useLocation);
  };

  const handleReset = () => {
    setSoilParams([
      {
        name: "Nitrogen",
        value: 75,
        unit: "kg/ha",
        min: 0,
        max: 150,
        optimal: "Optimal level: 60-100 kg/ha for most crops",
        icon: (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
            N
          </span>
        ),
      },
      {
        name: "Phosphorus",
        value: 45,
        unit: "kg/ha",
        min: 0,
        max: 100,
        optimal: "Optimal level: 30-60 kg/ha for most crops",
        icon: (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
            P
          </span>
        ),
      },
      {
        name: "Potassium",
        value: 80,
        unit: "kg/ha",
        min: 0,
        max: 150,
        optimal: "Optimal level: 60-100 kg/ha for most crops",
        icon: (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
            K
          </span>
        ),
      },
      {
        name: "Soil pH",
        value: 6.5,
        unit: "",
        min: 0,
        max: 14,
        optimal: "Optimal level: 6.0-7.5 for most crops",
        icon: (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200">
            pH
          </span>
        ),
      },
    ]);
    setEnvParams([
      {
        name: "Average Temperature",
        value: 21,
        unit: "°C",
        min: -10,
        max: 50,
        levels: ["Cold", "Moderate", "Hot"],
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        ),
      },
      {
        name: "Annual Rainfall",
        value: 95,
        unit: "cm",
        min: 0,
        max: 200,
        levels: ["Low", "Medium", "High"],
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        ),
      },
      {
        name: "Humidity",
        value: 65,
        unit: "%",
        min: 0,
        max: 100,
        levels: ["Dry", "Average", "Humid"],
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        ),
      },
    ]);
    setUseLocation(false);
    setLocationData(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current soil parameters
      const currentSoilParams = {
        nitrogen: soilParams[0].value,
        phosphorus: soilParams[1].value,
        potassium: soilParams[2].value,
        ph: soilParams[3].value
      };

      // Get current environmental parameters
      const currentEnvParams = {
        temperature: envParams[0].value,
        rainfall: envParams[1].value,
        humidity: envParams[2].value
      };

      // Make prediction
      const result = await predictCrop(currentSoilParams, currentEnvParams);

      if (result) {
        // Sanitize the result by removing SVG icons
        const sanitizedResult = {
          ...result,
          growing_conditions: Array.isArray(result.growing_conditions) 
            ? result.growing_conditions.map((condition: GrowingCondition) => ({
                ...condition,
                icon: undefined // Remove SVG icon strings
              }))
            : [],
          weather_forecast: Array.isArray(result.weather_forecast)
            ? result.weather_forecast.map((forecast: WeatherForecast) => ({
                ...forecast,
                icon: undefined // Remove SVG icon strings
              }))
            : []
        };

        // Navigate to results page with sanitized data
        navigate('/results', {
          state: {
            predictionResult: sanitizedResult,
            soilParams: soilParams.map(param => ({
              ...param,
              icon: undefined // Remove React node icons
            })),
            envParams: envParams.map(param => ({
              ...param,
              icon: undefined // Remove React node icons
            }))
          }
        });
      }
    } catch (err) {
      console.error('Error making prediction:', err);
      setError('Failed to generate prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fix for the Your Location container
  const LocationSection = () => (
    <div className="bg-white dark:bg-[#171717] p-4 rounded-lg flex justify-between items-center mb-6 shadow-sm border dark:border-gray-800">
      <div className="flex items-center">
        <div className="bg-green-100 dark:bg-primary/10 rounded-full p-2 mr-3">
          <MapPinIcon className="h-5 w-5 text-green-500 dark:text-primary" />
        </div>
        <div>
          <h3 className="text-base font-medium">Your Location</h3>
          <p className="text-sm text-muted-foreground">
            {locationData ? locationData.city : "No location data"}
          </p>
        </div>
      </div>
      <button
        onClick={handleLocationToggle}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center justify-center"
      >
        <MapPinIcon className="h-4 w-4 mr-2" />
        Use My Location
      </button>
    </div>
  );

  // Fix for the section icons
  const SoilParametersIcon = () => (
    <div className="bg-green-100 dark:bg-primary/10 rounded-full p-2 mr-2">
      <BeakerIcon className="h-5 w-5 text-green-500 dark:text-primary" />
    </div>
  );

  const EnvironmentalFactorsIcon = () => (
    <div className="bg-green-100 dark:bg-primary/10 rounded-full p-2 mr-2">
      <CloudIcon className="h-5 w-5 text-green-500 dark:text-primary" />
    </div>
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="pt-16"
    >
      <motion.div
        variants={fadeInUp}
        className="p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 
             max-w-6xl mx-auto mt-6 mb-20
             bg-gray-50 dark:bg-[#1A1A1A]
             transition-all duration-300 hover:shadow-lg"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-2xl font-bold mb-2 text-gray-900 dark:text-white"
        >
          Crop Prediction
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-gray-500 dark:text-gray-300 mb-6"
        >
          Get accurate crop recommendations based on your soil and local
          environmental conditions
        </motion.p>

        <form onSubmit={handleSubmit}>
          <motion.div variants={fadeInUp}>
            <LocationSection />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Soil Parameters */}
            <motion.div variants={fadeInUp}>
              <motion.div
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
              >
                <SoilParametersIcon />
                <h3 className="text-lg font-semibold">Soil Parameters</h3>
              </motion.div>

              {soilParams.map((param, index) => (
                <ParameterRow
                  key={param.name}
                  icon={param.icon}
                  label={param.name}
                  value={param.value}
                  onChange={(value) => handleSoilParamChange(index, value)}
                  unit={param.unit}
                  min={param.min}
                  max={param.max}
                  step={param.name === "Soil pH" ? 0.1 : 1}
                  optimalText={param.optimal}
                />
              ))}
            </motion.div>

            {/* Environmental Factors */}
            <motion.div variants={fadeInUp}>
              <motion.div
                className="flex items-center mb-4"
                whileHover={{ x: 5 }}
              >
                <EnvironmentalFactorsIcon />
                <h3 className="text-lg font-semibold">Environmental Factors</h3>
              </motion.div>

              {envParams.map((param, index) => (
                <ParameterRow
                  key={param.name}
                  icon={param.icon}
                  label={param.name}
                  value={param.value}
                  onChange={(value) => handleEnvParamChange(index, value)}
                  unit={param.unit}
                  min={param.min}
                  max={param.max}
                />
              ))}
            </motion.div>
          </motion.div>

          <FormButtons
            onReset={handleReset}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </form>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-[#171717] rounded-lg p-8 flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  Generating Prediction
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                  Please wait while we analyze your soil and environmental
                  parameters...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
