import os
import sys
import django
from pathlib import Path
import pandas as pd
import numpy as np

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_backend.settings")
django.setup()

from ml.training import train_model
from ml.utils import load_dataset, preprocess_dataset
from ml.models import CropModel


def main():
    print("Testing Model Training...")

    # Load dataset
    print("\nLoading dataset...")
    df = load_dataset("sample_datasets/Crop_recommendation_data.csv")
    print(f"Dataset loaded successfully. Shape: {df.shape}")

    # Preprocess dataset
    print("\nPreprocessing dataset...")
    data = preprocess_dataset(df)

    # Create training data DataFrame
    train_data = pd.DataFrame(data["X_train"], columns=data["feature_names"])
    train_data["crop"] = data["y_train"]

    # Test Random Forest
    print("\nTraining Random Forest model...")
    rf_model = CropModel(model_type="randomForest")
    rf_metrics = rf_model.train(train_data)

    print("\nRandom Forest metrics:")
    for metric, value in rf_metrics["metrics"].items():
        print(f"{metric}: {value}")

    print("\nRandom Forest Feature Importance:")
    for feature in rf_metrics["feature_importance"]:
        print(f"{feature['feature']}: {feature['importance']:.4f}")

    # Test XGBoost
    print("\nTraining XGBoost model...")
    xgb_model = CropModel(model_type="xgboost")
    xgb_metrics = xgb_model.train(train_data)

    print("\nXGBoost metrics:")
    for metric, value in xgb_metrics["metrics"].items():
        print(f"{metric}: {value}")

    print("\nXGBoost Feature Importance:")
    for feature in xgb_metrics["feature_importance"]:
        print(f"{feature['feature']}: {feature['importance']:.4f}")


if __name__ == "__main__":
    main()
