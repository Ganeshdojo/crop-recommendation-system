import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from collections import Counter

# Base path for data assets
DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "django_backend",
    "data",
)
DATASET_PATH = os.path.join(DATA_PATH, "sample_datasets")
MODELS_PATH = os.path.join(DATA_PATH, "default_models")
RECOMMENDATIONS_PATH = os.path.join(DATA_PATH, "recommendations")

# Ensure paths exist
os.makedirs(DATASET_PATH, exist_ok=True)
os.makedirs(MODELS_PATH, exist_ok=True)
os.makedirs(RECOMMENDATIONS_PATH, exist_ok=True)


def load_dataset(dataset_path):
    """
    Load a dataset from the specified path.

    Args:
        dataset_path (str): Path to the dataset file (can be relative or absolute)

    Returns:
        pd.DataFrame: Loaded dataset
    """
    try:
        # If the path is relative (doesn't start with a drive letter or /)
        if not os.path.isabs(dataset_path) and not dataset_path.startswith("/"):
            # Convert to absolute path using DATA_PATH
            dataset_path = os.path.join(DATA_PATH, dataset_path)

        # Normalize the path to handle any path separators
        dataset_path = os.path.normpath(dataset_path)

        # Check if the file exists
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset not found: {dataset_path}")

        # Load the dataset
        df = pd.read_csv(dataset_path)
        return df
    except Exception as e:
        raise Exception(f"Error loading dataset: {str(e)}")


def preprocess_dataset(df, target_column="crop"):
    """Preprocess dataset and split into train/test sets"""
    # Check if target column exists
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset")

    # Check if all required columns exist
    required_columns = ["N", "P", "K", "pH", "temperature", "rainfall", "humidity"]
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Required column '{col}' not found in dataset")

    # Create a copy of the dataframe to avoid modifying the original
    df = df.copy()

    # Basic cleaning of target column
    df[target_column] = df[target_column].fillna("unknown").astype(str).str.strip()

    # Split into features and target
    X = df[required_columns].copy()
    y = df[target_column].copy()

    # Convert numeric columns to float
    X = X.astype(float)

    # Basic feature scaling
    X = (X - X.mean()) / X.std()

    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "feature_names": required_columns,
        "target_name": target_column,
        "classes": sorted(y.unique().tolist()),
    }


def generate_crop_recommendations(crop_name, soil_params):
    """Generate specific recommendations based on crop and soil parameters"""
    # Map crop to general growing conditions
    crop_conditions = {
        "rice": {
            "optimal_n": (70, 100),
            "optimal_p": (30, 50),
            "optimal_k": (60, 90),
            "optimal_ph": (5.5, 6.5),
            "temp_range": "22-30°C",
            "rainfall": "150-300cm",
            "growing_period": "90-120 days",
        },
        "wheat": {
            "optimal_n": (80, 120),
            "optimal_p": (40, 60),
            "optimal_k": (70, 100),
            "optimal_ph": (6.0, 7.5),
            "temp_range": "15-24°C",
            "rainfall": "45-65cm",
            "growing_period": "120-150 days",
        },
        "maize": {
            "optimal_n": (90, 140),
            "optimal_p": (30, 50),
            "optimal_k": (60, 90),
            "optimal_ph": (5.8, 7.0),
            "temp_range": "20-30°C",
            "rainfall": "50-80cm",
            "growing_period": "100-140 days",
        },
        "cotton": {
            "optimal_n": (60, 100),
            "optimal_p": (30, 50),
            "optimal_k": (60, 90),
            "optimal_ph": (6.0, 7.5),
            "temp_range": "20-30°C",
            "rainfall": "60-120cm",
            "growing_period": "150-180 days",
        },
    }

    # Default values if crop not found
    default_conditions = {
        "optimal_n": (70, 100),
        "optimal_p": (30, 60),
        "optimal_k": (60, 100),
        "optimal_ph": (6.0, 7.0),
        "temp_range": "20-30°C",
        "rainfall": "50-100cm",
        "growing_period": "90-120 days",
    }

    # Get conditions for the crop (use default if not found)
    conditions = crop_conditions.get(crop_name.lower(), default_conditions)

    # Generate recommendations based on soil parameters
    recommendations = []

    # Nitrogen recommendation
    n_value = soil_params.get("nitrogen", 0)
    if n_value < conditions["optimal_n"][0]:
        recommendations.append(
            f"Increase nitrogen application to reach optimal level ({conditions['optimal_n'][0]}-{conditions['optimal_n'][1]} kg/ha) for {crop_name}. Consider using nitrogen-rich fertilizers."
        )
    elif n_value > conditions["optimal_n"][1]:
        recommendations.append(
            f"Reduce nitrogen application to optimal level ({conditions['optimal_n'][0]}-{conditions['optimal_n'][1]} kg/ha) for {crop_name} to prevent excessive vegetative growth."
        )
    else:
        recommendations.append(
            f"Maintain current nitrogen levels which are within the optimal range for {crop_name}."
        )

    # Phosphorus recommendation
    p_value = soil_params.get("phosphorus", 0)
    if p_value < conditions["optimal_p"][0]:
        recommendations.append(
            f"Increase phosphorus application to reach optimal level ({conditions['optimal_p'][0]}-{conditions['optimal_p'][1]} kg/ha) for {crop_name}. This will improve root development and flowering."
        )
    elif p_value > conditions["optimal_p"][1]:
        recommendations.append(
            f"Reduce phosphorus application to optimal level ({conditions['optimal_p'][0]}-{conditions['optimal_p'][1]} kg/ha) for {crop_name}."
        )
    else:
        recommendations.append(
            f"Maintain current phosphorus levels which are within the optimal range for {crop_name}."
        )

    # Potassium recommendation
    k_value = soil_params.get("potassium", 0)
    if k_value < conditions["optimal_k"][0]:
        recommendations.append(
            f"Increase potassium application to reach optimal level ({conditions['optimal_k'][0]}-{conditions['optimal_k'][1]} kg/ha) for {crop_name}. This will improve disease resistance and water regulation."
        )
    elif k_value > conditions["optimal_k"][1]:
        recommendations.append(
            f"Reduce potassium application to optimal level ({conditions['optimal_k'][0]}-{conditions['optimal_k'][1]} kg/ha) for {crop_name}."
        )
    else:
        recommendations.append(
            f"Maintain current potassium levels which are within the optimal range for {crop_name}."
        )

    # pH recommendation
    ph_value = soil_params.get("ph", 7.0)
    if ph_value < conditions["optimal_ph"][0]:
        recommendations.append(
            f"Apply agricultural lime to increase soil pH to the optimal range ({conditions['optimal_ph'][0]}-{conditions['optimal_ph'][1]}) for {crop_name}."
        )
    elif ph_value > conditions["optimal_ph"][1]:
        recommendations.append(
            f"Apply elemental sulfur or acidifying amendments to decrease soil pH to the optimal range ({conditions['optimal_ph'][0]}-{conditions['optimal_ph'][1]}) for {crop_name}."
        )
    else:
        recommendations.append(
            f"Maintain current soil pH which is within the optimal range for {crop_name}."
        )

    # General cultivation recommendations
    recommendations.append(
        f"Plant {crop_name} when soil temperature is suitable for germination. Optimal growing temperature range is {conditions['temp_range']}."
    )
    recommendations.append(
        f"Ensure adequate irrigation, especially during critical growth stages. {crop_name} requires approximately {conditions['rainfall']} of water throughout its growing season."
    )
    recommendations.append(
        f"The growing period for {crop_name} is typically {conditions['growing_period']}. Plan your cropping calendar accordingly."
    )

    return recommendations


def calculate_parameter_match(param_value, optimal_min, optimal_max):
    """Calculate how well a parameter matches the optimal range (0-100%)"""
    if optimal_min <= param_value <= optimal_max:
        # Within optimal range - 100% match
        return 100

    # Outside optimal range - calculate match percentage
    range_width = optimal_max - optimal_min
    mid_point = (optimal_min + optimal_max) / 2

    if param_value < optimal_min:
        # Below optimal range
        distance_from_optimal = optimal_min - param_value
        match_percent = max(0, 100 - (distance_from_optimal / (range_width / 2) * 100))
    else:
        # Above optimal range
        distance_from_optimal = param_value - optimal_max
        match_percent = max(0, 100 - (distance_from_optimal / (range_width / 2) * 100))

    return min(100, match_percent)


def calculate_overall_match(soil_params, crop_name):
    """Calculate overall match percentage and individual parameter matches"""
    # Get optimal conditions for the crop
    crop_conditions = {
        "rice": {
            "optimal_n": (70, 100),
            "optimal_p": (30, 50),
            "optimal_k": (60, 90),
            "optimal_ph": (5.5, 6.5),
        },
        "wheat": {
            "optimal_n": (80, 120),
            "optimal_p": (40, 60),
            "optimal_k": (70, 100),
            "optimal_ph": (6.0, 7.5),
        },
        "maize": {
            "optimal_n": (90, 140),
            "optimal_p": (30, 50),
            "optimal_k": (60, 90),
            "optimal_ph": (5.8, 7.0),
        },
        "cotton": {
            "optimal_n": (60, 100),
            "optimal_p": (30, 50),
            "optimal_k": (60, 90),
            "optimal_ph": (6.0, 7.5),
        },
        # Add more crops as needed
    }

    # Default values if crop not found
    default_conditions = {
        "optimal_n": (70, 100),
        "optimal_p": (30, 60),
        "optimal_k": (60, 100),
        "optimal_ph": (6.0, 7.0),
    }

    # Get conditions for the crop (use default if not found)
    conditions = crop_conditions.get(crop_name.lower(), default_conditions)

    # Calculate match percentages for each parameter
    n_match = calculate_parameter_match(
        soil_params.get("nitrogen", 0),
        conditions["optimal_n"][0],
        conditions["optimal_n"][1],
    )

    p_match = calculate_parameter_match(
        soil_params.get("phosphorus", 0),
        conditions["optimal_p"][0],
        conditions["optimal_p"][1],
    )

    k_match = calculate_parameter_match(
        soil_params.get("potassium", 0),
        conditions["optimal_k"][0],
        conditions["optimal_k"][1],
    )

    ph_match = calculate_parameter_match(
        soil_params.get("ph", 7.0),
        conditions["optimal_ph"][0],
        conditions["optimal_ph"][1],
    )

    # Calculate overall match (weighted average)
    overall_match = n_match * 0.25 + p_match * 0.25 + k_match * 0.25 + ph_match * 0.25

    # Format the result
    match_params = [
        {
            "name": "Nitrogen",
            "match": round(n_match),
            "value": soil_params.get("nitrogen", 0),
            "unit": "kg/ha",
        },
        {
            "name": "Phosphorus",
            "match": round(p_match),
            "value": soil_params.get("phosphorus", 0),
            "unit": "kg/ha",
        },
        {
            "name": "Potassium",
            "match": round(k_match),
            "value": soil_params.get("potassium", 0),
            "unit": "kg/ha",
        },
        {
            "name": "pH Level",
            "match": round(ph_match),
            "value": soil_params.get("ph", 7.0),
            "unit": "",
        },
    ]

    return {"overall_match": round(overall_match), "parameters": match_params}
