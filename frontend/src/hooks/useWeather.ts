import { useState, useEffect } from 'react';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  dt_txt?: string;
}

interface ForecastResponse {
  current: WeatherData;
  daily: WeatherData[];
}

export const useWeather = (city: string = 'madanapalle', country: string = 'in') => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // First get coordinates for the city
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=1f68c36d6f9904008cc8e05cc7868a16`
        );
        const [geoData] = await geoResponse.json();
        
        if (!geoData) {
          throw new Error('Location not found');
        }

        // Then get 5-day forecast using coordinates
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${geoData.lat}&lon=${geoData.lon}&appid=1f68c36d6f9904008cc8e05cc7868a16&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        // Get current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${geoData.lat}&lon=${geoData.lon}&appid=1f68c36d6f9904008cc8e05cc7868a16&units=metric`
        );
        const currentData = await currentResponse.json();

        setWeather(currentData);
        // Get one forecast per day (at noon)
        const dailyForecasts = forecastData.list.filter((item: WeatherData) => 
          item.dt_txt?.includes('12:00:00')
        ).slice(0, 5);
        setForecast(dailyForecasts);
      } catch (err) {
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, country]);

  return { weather, forecast, loading, error };
};