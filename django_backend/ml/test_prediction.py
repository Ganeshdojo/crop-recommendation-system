import os
import sys
import django
from pathlib import Path
import pandas as pd
import requests
from django.http import JsonResponse

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_backend.settings")
django.setup()

from ml.models import CropModel
from ml.utils import MODELS_PATH


def test_model_prediction():
    """Test the trained model's prediction functionality"""
    print("\nTesting Model Prediction...")

    try:
        # Find the latest model
        model_files = [f for f in os.listdir(MODELS_PATH) if f.endswith(".pkl")]
        if not model_files:
            print("Error: No trained model found!")
            return

        latest_model = max(
            model_files, key=lambda x: os.path.getctime(os.path.join(MODELS_PATH, x))
        )
        model_path = os.path.join(MODELS_PATH, latest_model)

        print(f"Loading model from: {model_path}")
        model = CropModel.load(model_path)

        # Test data (optimal values for wheat)
        test_data = pd.DataFrame(
            [
                {
                    "N": 200,  # High nitrogen
                    "P": 200,  # Moderate phosphorus
                    "K": 200,  # Moderate potassium
                    "temperature": 20,  # Optimal temperature
                    "humidity": 2000,  # Moderate humidity
                    "pH": 200,  # Optimal pH
                    "rainfall": 20,  # Adequate rainfall
                }
            ]
        )

        print("\nMaking prediction with test data:")
        for col in test_data.columns:
            print(f"{col}: {test_data[col].iloc[0]}")

        # Get prediction
        prediction = model.predict(test_data)

        print("\nPrediction Results:")
        print(f"Top Recommended Crop: {prediction['top_crop']['crop']}")
        print(f"Confidence: {prediction['top_crop']['confidence']:.2f}%")

        print("\nTop 5 Crop Matches:")
        for match in prediction["crop_matches"]:
            print(f"- {match['crop']}: {match['confidence']:.2f}%")

    except Exception as e:
        print(f"Error during prediction test: {str(e)}")


def test_prediction_api():
    """Test the prediction API endpoint"""
    print("\nTesting Prediction API...")

    try:
        # Test data (same as model test)
        test_data = {
            "N": 90,
            "P": 40,
            "K": 45,
            "temperature": 24.0,
            "humidity": 65,
            "pH": 6.5,
            "rainfall": 85.0,
        }

        # Make API request
        response = requests.post(
            "http://localhost:8000/api/predict/",
            json=test_data,
            headers={"Content-Type": "application/json"},
        )

        print(f"\nAPI Response Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()

            print("\nPrediction Results:")
            print(f"Top Recommended Crop: {result['top_crop']['crop']}")
            print(f"Confidence: {result['top_crop']['confidence']:.2f}%")

            print("\nTop 5 Crop Matches:")
            for match in result["crop_matches"]:
                print(f"- {match['crop']}: {match['confidence']:.2f}%")

            print("\nMatch Analysis:")
            analysis = result["match_analysis"]
            print(f"Overall Match: {analysis['overall_match']:.2f}%")
            print(f"Soil Match: {analysis['soil_match']}%")
            print(f"Climate Match: {analysis['climate']}%")
            print(f"Water Needs Match: {analysis['water_needs']}%")

            print("\nRecommendations:")
            for rec in result["recommendations"]:
                print(f"- {rec}")
        else:
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"Error during API test: {str(e)}")


def main():
    print("Starting Prediction Tests...")

    # Test model prediction directly
    test_model_prediction()

    # Test prediction API
    test_prediction_api()

    print("\nPrediction Tests Completed!")


if __name__ == "__main__":
    main()
