import os
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import pickle
from django.conf import settings

from .models import CropModel
from .utils import (
    MODELS_PATH,
    RECOMMENDATIONS_PATH,
    generate_crop_recommendations,
    calculate_overall_match,
)

# Path to the default model
DEFAULT_MODEL_PATH = os.path.join(MODELS_PATH, "default_model.pkl")


def load_default_model():
    """
    Load the default trained model for prediction.

    Returns:
        CropModel: Loaded model or None if loading fails
    """
    try:
        # Get the default model path
        default_model_path = os.path.join(
            settings.BASE_DIR, "ml", "models", "default_model.pkl"
        )

        if not os.path.exists(default_model_path):
            print(f"Default model not found at {default_model_path}")
            return None

        # Load the model
        with open(default_model_path, "rb") as f:
            model = pickle.load(f)

        if not isinstance(model, CropModel):
            print("Loaded model is not a valid CropModel instance")
            return None

        return model
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return None


def generate_prediction(soil_params, env_params):
    """
    Generate crop predictions based on soil and environmental parameters.

    Args:
        soil_params (dict): Soil parameters including nitrogen, phosphorus, potassium, and pH
        env_params (dict): Environmental parameters including temperature, rainfall, and humidity

    Returns:
        dict: Prediction results including top crop recommendation and alternatives
    """
    try:
        # Format input data for prediction
        input_data = pd.DataFrame(
            [
                {
                    "N": float(soil_params.get("nitrogen", 0)),
                    "P": float(soil_params.get("phosphorus", 0)),
                    "K": float(soil_params.get("potassium", 0)),
                    "pH": float(soil_params.get("ph", 0)),
                    "temperature": float(env_params.get("temperature", 0)),
                    "rainfall": float(env_params.get("rainfall", 0)),
                    "humidity": float(env_params.get("humidity", 0)),
                }
            ]
        )

        # Try to load the model
        model = load_default_model()

        if model and isinstance(model, CropModel):
            # Make prediction using the model
            prediction_result = model.predict(input_data)
            if prediction_result is None:
                raise Exception("Model prediction failed")

            top_crop = prediction_result["top_crop"]["crop"]
            confidence = prediction_result["top_crop"]["confidence"]
            crop_matches = prediction_result["crop_matches"]
        else:
            # If no model is available, use a more sophisticated fallback
            # based on the input parameters
            crops = get_crops_for_conditions(input_data)
            top_crop = crops[0]["crop"]
            confidence = crops[0]["confidence"]
            crop_matches = crops

        # Load crop data from JSON file
        crop_data = load_crop_data()

        # Get the crop information
        crop_info = crop_data.get(top_crop, crop_data.get("Wheat"))

        # Calculate soil parameter matches
        match_analysis = calculate_overall_match(soil_params, top_crop)

        # Generate specific recommendations based on soil parameters
        recommendations = generate_crop_recommendations(top_crop, soil_params)

        # Get growing conditions for the crop
        growing_conditions = []
        for key, value in crop_info.get("growingConditions", {}).items():
            growing_conditions.append(
                {"name": key, "value": value, "icon": get_icon_for_condition(key)}
            )

        # Generate cultivation timeline
        timeline = generate_timeline(top_crop)

        # Generate weather forecast based on env params
        weather_forecast = generate_weather_forecast(env_params)

        # Create alternative crop recommendations
        alternative_crops = []
        for crop_match in crop_matches[1:4]:  # Take 2nd to 4th matches
            crop = crop_match["crop"]
            match = int(crop_match["confidence"] * 100)
            alternative_crops.append({"name": crop, "match": match})

        # Return comprehensive prediction results
        return {
            "top_crop": {"crop": top_crop, "confidence": confidence},
            "crop_matches": crop_matches,
            "match_analysis": match_analysis,
            "growing_conditions": growing_conditions,
            "recommendations": recommendations,
            "timeline": timeline,
            "weather_forecast": weather_forecast,
            "alternative_crops": alternative_crops,
            "crop_info": crop_info,
        }
    except Exception as e:
        # Log the error and return a default response
        print(f"Error generating prediction: {str(e)}")
        return get_default_prediction()


def load_crop_data():
    """Load crop data from JSON file"""
    crop_data_path = os.path.join(RECOMMENDATIONS_PATH, "crop_data.json")

    # Check if the file exists, if not create it
    if not os.path.exists(crop_data_path):
        create_default_crop_data(crop_data_path)

    with open(crop_data_path, "r") as f:
        crop_data = json.load(f)

    return crop_data


def create_default_crop_data(filepath):
    """Create default crop data JSON file"""
    default_data = {
        "Wheat": {
            "image": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2hlYXR8ZW58MHx8MHx8fDA%3D",
            "growingConditions": {
                "Temperature": "15-25°C",
                "Rainfall": "450-650mm",
                "Growth Period": "120-150 days",
                "Optimal pH": "6.0-7.5",
            },
            "soilRequirements": {
                "nitrogen": "60-100 kg/ha",
                "phosphorus": "30-60 kg/ha",
                "potassium": "60-100 kg/ha",
                "ph": "6.0-7.5",
            },
            "description": "Wheat is a cereal grain that's a worldwide staple food. It's versatile and adaptable to various soil conditions with high nitrogen requirements.",
        },
        "Barley": {
            "image": "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFybGV5fGVufDB8fDB8fHww",
            "growingConditions": {
                "Temperature": "15-24°C",
                "Rainfall": "350-550mm",
                "Growth Period": "90-120 days",
                "Optimal pH": "6.0-7.0",
            },
            "soilRequirements": {
                "nitrogen": "50-90 kg/ha",
                "phosphorus": "20-50 kg/ha",
                "potassium": "50-90 kg/ha",
                "ph": "6.0-7.0",
            },
            "description": "Barley is a hardy cereal grain with a high tolerance for drought and adaptability to various soil conditions.",
        },
        "Oats": {
            "image": "https://images.unsplash.com/photo-1595435934819-5aadc815c045?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8b2F0c3xlbnwwfHwwfHx8MA%3D%3D",
            "growingConditions": {
                "Temperature": "16-22°C",
                "Rainfall": "400-600mm",
                "Growth Period": "90-120 days",
                "Optimal pH": "5.5-7.0",
            },
            "soilRequirements": {
                "nitrogen": "40-80 kg/ha",
                "phosphorus": "20-40 kg/ha",
                "potassium": "40-80 kg/ha",
                "ph": "5.5-7.0",
            },
            "description": "Oats are a nutrient-rich cereal grain that can improve soil health and prevent erosion when used in crop rotation.",
        },
        "Maize": {
            "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29ybnxlbnwwfHwwfHx8MA%3D%3D",
            "growingConditions": {
                "Temperature": "20-30°C",
                "Rainfall": "500-800mm",
                "Growth Period": "100-140 days",
                "Optimal pH": "5.8-6.8",
            },
            "soilRequirements": {
                "nitrogen": "80-120 kg/ha",
                "phosphorus": "30-50 kg/ha",
                "potassium": "60-100 kg/ha",
                "ph": "5.8-6.8",
            },
            "description": "Maize (corn) is a heat-loving crop with high yield potential, requiring substantial nitrogen and consistent moisture.",
        },
        "Cotton": {
            "image": "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y290dG9ufGVufDB8fDB8fHww",
            "growingConditions": {
                "Temperature": "20-30°C",
                "Rainfall": "600-1200mm",
                "Growth Period": "150-180 days",
                "Optimal pH": "6.0-7.5",
            },
            "soilRequirements": {
                "nitrogen": "60-100 kg/ha",
                "phosphorus": "30-50 kg/ha",
                "potassium": "60-90 kg/ha",
                "ph": "6.0-7.5",
            },
            "description": "Cotton thrives in warm climates with long growing seasons and well-drained soils. It requires moderate to high levels of nutrients.",
        },
    }

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, "w") as f:
        json.dump(default_data, f, indent=2)


def get_icon_for_condition(condition_name):
    """Return an icon reference for different growing conditions"""
    # This will be used by the frontend to display the appropriate icon
    icon_mapping = {
        "Temperature": '<svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>',
        "Rainfall": '<svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>',
        "Growth Period": '<svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
        "Optimal pH": '<svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
    }

    return icon_mapping.get(
        condition_name,
        '<svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    )


def generate_timeline(crop_name):
    """Generate cultivation timeline for the crop"""
    # Default timelines for different crops
    timelines = {
        "wheat": [
            {
                "stage": "Planting",
                "duration": "1 week",
                "description": "Prepare soil and plant seeds at appropriate depth",
            },
            {
                "stage": "Germination",
                "duration": "1-2 weeks",
                "description": "Seeds germinate and first shoots appear",
            },
            {
                "stage": "Tillering",
                "duration": "3-5 weeks",
                "description": "Multiple stems develop from the main shoot",
            },
            {
                "stage": "Stem Extension",
                "duration": "6-8 weeks",
                "description": "Stems grow taller and nodes develop",
            },
            {
                "stage": "Heading",
                "duration": "9-10 weeks",
                "description": "Wheat heads emerge from the stem",
            },
            {
                "stage": "Flowering",
                "duration": "11 weeks",
                "description": "Pollination occurs",
            },
            {
                "stage": "Ripening",
                "duration": "12-15 weeks",
                "description": "Grain matures and dries",
            },
        ],
        "barley": [
            {
                "stage": "Planting",
                "duration": "1 week",
                "description": "Prepare soil and plant seeds 2-3 cm deep",
            },
            {
                "stage": "Germination",
                "duration": "1-2 weeks",
                "description": "Seeds germinate and first shoots appear",
            },
            {
                "stage": "Tillering",
                "duration": "3-4 weeks",
                "description": "Multiple stems develop from the main shoot",
            },
            {
                "stage": "Stem Extension",
                "duration": "5-7 weeks",
                "description": "Stems grow taller and nodes develop",
            },
            {
                "stage": "Heading",
                "duration": "8-9 weeks",
                "description": "Barley heads emerge from the stem",
            },
            {
                "stage": "Flowering",
                "duration": "10 weeks",
                "description": "Pollination occurs",
            },
            {
                "stage": "Ripening",
                "duration": "11-13 weeks",
                "description": "Grain matures and dries",
            },
        ],
        "maize": [
            {
                "stage": "Planting",
                "duration": "1 week",
                "description": "Plant seeds 4-5 cm deep in warm soil",
            },
            {
                "stage": "Emergence",
                "duration": "1-2 weeks",
                "description": "Seedlings emerge from the soil",
            },
            {
                "stage": "Vegetative Growth",
                "duration": "3-9 weeks",
                "description": "Rapid growth and leaf development",
            },
            {
                "stage": "Tasseling",
                "duration": "10 weeks",
                "description": "Tassels form at the top of the plant",
            },
            {
                "stage": "Silking",
                "duration": "11-12 weeks",
                "description": "Silks emerge from ear shoots",
            },
            {
                "stage": "Kernel Development",
                "duration": "13-16 weeks",
                "description": "Kernels fill with starch",
            },
            {
                "stage": "Maturity",
                "duration": "17-20 weeks",
                "description": "Kernels reach physiological maturity",
            },
        ],
    }

    # Return the timeline for the requested crop, or a default timeline
    return timelines.get(crop_name.lower(), timelines["wheat"])


def generate_weather_forecast(env_params):
    """Generate a mock weather forecast based on environmental parameters"""
    today = datetime.now()

    # Create a 5-day forecast based on the provided env parameters
    base_temp = env_params.get("temperature", 25)
    base_humidity = env_params.get("humidity", 65)

    weather_conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain"]

    forecast = []
    for i in range(5):
        current_date = today + timedelta(days=i)

        # Randomize temperature and humidity a bit
        temp_variation = np.random.randint(-3, 4)
        humidity_variation = np.random.randint(-10, 11)

        # Select random weather condition
        condition = np.random.choice(weather_conditions, p=[0.4, 0.3, 0.15, 0.1, 0.05])

        day_name = (
            "Today"
            if i == 0
            else ("Tomorrow" if i == 1 else current_date.strftime("%A"))
        )

        forecast.append(
            {
                "day": day_name,
                "date": current_date.strftime("%b %d"),
                "temp": base_temp + temp_variation,
                "condition": condition,
                "humidity": min(100, max(0, base_humidity + humidity_variation)),
                "icon": get_weather_icon(condition),
            }
        )

    return forecast


def get_weather_icon(condition):
    """Return a reference to a weather icon based on the condition"""
    # This will be used by the frontend to display the appropriate icon
    icon_mapping = {
        "Sunny": '<svg class="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
        "Partly Cloudy": '<svg class="h-8 w-8 text-blue-300" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 11.9c0-1.7 1.3-3 3-3 .7 0 1.3.2 1.8.6.5-1.9 2.2-3.4 4.2-3.4 2.4 0 4.4 2 4.4 4.4 0 .3 0 .7-.1 1 .1 0 .3-.1.4-.1 1.7 0 3 1.3 3 3s-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" /></svg>',
        "Cloudy": '<svg class="h-8 w-8 text-blue-300" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 11.9c0-1.7 1.3-3 3-3 .7 0 1.3.2 1.8.6.5-1.9 2.2-3.4 4.2-3.4 2.4 0 4.4 2 4.4 4.4 0 .3 0 .7-.1 1 .1 0 .3-.1.4-.1 1.7 0 3 1.3 3 3s-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" /></svg>',
        "Light Rain": '<svg class="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 9.5a.5.5 0 11-1 0 .5.5 0 011 0zm-5 1a.5.5 0 11-1 0 .5.5 0 011 0zM12 16a.5.5 0 11-1 0 .5.5 0 011 0zm5-3.5a.5.5 0 11-1 0 .5.5 0 011 0zM4 11.9c0-1.7 1.3-3 3-3 .7 0 1.3.2 1.8.6.5-1.9 2.2-3.4 4.2-3.4 2.4 0 4.4 2 4.4 4.4 0 .3 0 .7-.1 1 .1 0 .3-.1.4-.1 1.7 0 3 1.3 3 3s-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" /></svg>',
        "Rain": '<svg class="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 9.5a.5.5 0 11-1 0 .5.5 0 011 0zm-5 1a.5.5 0 11-1 0 .5.5 0 011 0zM12 16a.5.5 0 11-1 0 .5.5 0 011 0zm5-3.5a.5.5 0 11-1 0 .5.5 0 011 0zM4 11.9c0-1.7 1.3-3 3-3 .7 0 1.3.2 1.8.6.5-1.9 2.2-3.4 4.2-3.4 2.4 0 4.4 2 4.4 4.4 0 .3 0 .7-.1 1 .1 0 .3-.1.4-.1 1.7 0 3 1.3 3 3s-1.3 3-3 3H7c-1.7 0-3-1.3-3-3z" /></svg>',
    }

    return icon_mapping.get(condition, icon_mapping["Partly Cloudy"])


def get_default_prediction():
    """Get a default prediction when model loading fails"""
    return {
        "top_crop": {"crop": "Wheat", "confidence": 0.92},
        "crop_matches": [
            {"crop": "Wheat", "confidence": 0.92},
            {"crop": "Rice", "confidence": 0.85},
            {"crop": "Maize", "confidence": 0.80},
        ],
        "match_analysis": {
            "overall_match": 85,
            "parameter_matches": {
                "nitrogen": 90,
                "phosphorus": 85,
                "potassium": 80,
                "ph": 85,
            },
        },
        "growing_conditions": [
            {"name": "Temperature", "value": "15-25°C", "icon": "thermometer"},
            {"name": "Rainfall", "value": "450-650mm", "icon": "cloud-rain"},
            {"name": "Soil pH", "value": "6.0-7.5", "icon": "droplet"},
        ],
        "recommendations": [
            "Maintain soil pH between 6.0 and 7.5",
            "Ensure adequate nitrogen levels",
            "Monitor soil moisture regularly",
        ],
        "timeline": [
            {"stage": "Planting", "duration": "October-November"},
            {"stage": "Growth", "duration": "December-February"},
            {"stage": "Harvest", "duration": "March-April"},
        ],
        "weather_forecast": {
            "temperature": "20°C",
            "rainfall": "50mm",
            "humidity": "65%",
        },
        "alternative_crops": [
            {"name": "Rice", "match": 85},
            {"name": "Maize", "match": 80},
        ],
        "crop_info": {
            "description": "Wheat is a staple crop grown worldwide",
            "growingConditions": {
                "temperature": "15-25°C",
                "rainfall": "450-650mm",
                "soilType": "Well-drained loamy soil",
            },
        },
    }


def get_crops_for_conditions(input_data):
    """Get suitable crops based on input conditions when model is not available"""
    # Define crop requirements
    crop_requirements = {
        "Wheat": {
            "N": (60, 100),
            "P": (30, 60),
            "K": (60, 100),
            "pH": (6.0, 7.5),
            "temperature": (15, 25),
            "rainfall": (450, 650),
        },
        "Rice": {
            "N": (80, 120),
            "P": (40, 60),
            "K": (40, 60),
            "pH": (5.5, 6.5),
            "temperature": (20, 30),
            "rainfall": (1000, 2000),
        },
        "Maize": {
            "N": (80, 120),
            "P": (30, 50),
            "K": (40, 60),
            "pH": (5.8, 6.8),
            "temperature": (20, 30),
            "rainfall": (500, 800),
        },
        "Apple": {
            "N": (60, 100),
            "P": (30, 50),
            "K": (60, 100),
            "pH": (6.0, 7.0),
            "temperature": (15, 25),
            "rainfall": (600, 800),
        },
        "Banana": {
            "N": (100, 150),
            "P": (40, 60),
            "K": (100, 150),
            "pH": (5.5, 7.0),
            "temperature": (25, 35),
            "rainfall": (1000, 2000),
        },
        "Potato": {
            "N": (100, 150),
            "P": (40, 60),
            "K": (150, 200),
            "pH": (5.0, 6.0),
            "temperature": (15, 20),
            "rainfall": (500, 700),
        },
        "Tomato": {
            "N": (100, 150),
            "P": (40, 60),
            "K": (150, 200),
            "pH": (6.0, 6.8),
            "temperature": (20, 25),
            "rainfall": (600, 800),
        },
        "Cotton": {
            "N": (60, 100),
            "P": (30, 50),
            "K": (40, 60),
            "pH": (6.0, 7.0),
            "temperature": (25, 35),
            "rainfall": (500, 800),
        },
    }

    # Calculate match scores for each crop
    crop_matches = []
    for crop, requirements in crop_requirements.items():
        match_score = 0
        total_weights = 0

        # Calculate match for each parameter
        for param, (min_val, max_val) in requirements.items():
            if param in input_data:
                value = input_data[param]
                if min_val <= value <= max_val:
                    match_score += 1
                else:
                    # Calculate how far the value is from the optimal range
                    if value < min_val:
                        diff = min_val - value
                    else:
                        diff = value - max_val
                    # Normalize the difference
                    range_size = max_val - min_val
                    match_score += max(0, 1 - (diff / range_size))
                total_weights += 1

        # Calculate final confidence score
        confidence = match_score / total_weights if total_weights > 0 else 0
        crop_matches.append({"crop": crop, "confidence": confidence})

    # Sort by confidence and return
    return sorted(crop_matches, key=lambda x: x["confidence"], reverse=True)
