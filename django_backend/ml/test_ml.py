# In django_backend/ml directory, create a test_ml.py file:

import os
import sys
import django
from pathlib import Path

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_backend.settings")
django.setup()

# Now import your ML modules
from ml.training import train_model
from ml.prediction import generate_prediction


def test_model_setup():
    print("\nTesting Model Setup...")
    # Test Random Forest
    try:
        dataset_path = (
            BASE_DIR / "data" / "sample_datasets" / "Crop_recommendation_data.csv"
        )
        result = train_model(algorithm="random_forest", dataset_path=str(dataset_path))
        print("✅ Random Forest training successful:", result)
    except Exception as e:
        print("❌ Random Forest training failed:", str(e))

    # Test XGBoost
    try:
        result = train_model(algorithm="xgboost", dataset_path=str(dataset_path))
        print("✅ XGBoost training successful:", result)
    except Exception as e:
        print("❌ XGBoost training failed:", str(e))


def test_prediction_pipeline():
    print("\nTesting Prediction Pipeline...")
    sample_soil_params = {"N": 70, "P": 32, "K": 33, "ph": 7.5}

    sample_env_params = {"temperature": 27.87, "humidity": 21.0, "rainfall": 110.93}

    try:
        prediction = generate_prediction(sample_soil_params, sample_env_params)
        print("✅ Prediction generation successful:", prediction)

        # Verify required fields
        for field in ["predicted_crop", "match_parameters", "cultivation_advice"]:
            if (
                field in prediction and prediction[field]
            ):  # Check if field exists and is not empty
                print(f"✅ {field} present in prediction")
            else:
                print(f"❌ Missing {field} in prediction")

    except Exception as e:
        print("❌ Prediction generation failed:", str(e))


def test_training_pipeline():
    print("\nTesting Training Pipeline...")
    try:
        # Test with valid dataset
        dataset_path = (
            BASE_DIR / "data" / "sample_datasets" / "Crop_recommendation_data.csv"
        )
        # validation_result = validate_dataset(str(dataset_path))
        # print("✅ Dataset validation:", validation_result)

        # Test model saving
        # save_result = save_dataset(
        #     dataset_path=str(dataset_path), filename="test_dataset.csv"
        # )
        # print("✅ Dataset saving:", save_result)

    except Exception as e:
        print("❌ Training pipeline test failed:", str(e))


def verify_data_files():
    print("\nVerifying Required Data Files...")
    required_paths = [
        BASE_DIR / "data" / "sample_datasets" / "Crop_recommendation_data.csv",
        BASE_DIR / "data" / "recommendations",
        BASE_DIR / "models",
    ]

    for path in required_paths:
        if path.exists():
            print(f"✅ Found: {path}")
        else:
            print(f"❌ Missing: {path}")


if __name__ == "__main__":
    print("=== Starting ML Component Tests ===")
    verify_data_files()  # Check required files first
    test_model_setup()
    test_prediction_pipeline()
    test_training_pipeline()
    print("\n=== Testing Complete ===")
