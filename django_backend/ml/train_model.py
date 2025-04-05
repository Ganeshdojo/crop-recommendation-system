import os
import sys
import django
from pathlib import Path
import pandas as pd

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_backend.settings")
django.setup()

from ml.models import CropModel
from ml.utils import MODELS_PATH


def train_model():
    """Train a new crop prediction model"""
    print("\nStarting model training...")

    try:
        # Load dataset
        dataset_path = os.path.join(
            BASE_DIR, "data", "sample_datasets", "Crop_recommendation_data.csv"
        )
        print(f"Loading dataset from: {dataset_path}")

        data = pd.read_csv(dataset_path)
        print(f"Dataset loaded successfully. Shape: {data.shape}")

        # Initialize model
        model = CropModel(model_type="randomForest")
        print("Model initialized with Random Forest algorithm")

        # Train model
        print("\nTraining model...")
        metrics = model.train(data)

        # Save model
        model_path = os.path.join(MODELS_PATH, "crop_prediction_model.pkl")
        model.save(model_path)
        print(f"\nModel saved to: {model_path}")

        # Print metrics
        print("\nTraining Metrics:")
        print(f"Accuracy: {metrics['metrics']['accuracy']}")
        print(f"Precision: {metrics['metrics']['precision']}")
        print(f"Recall: {metrics['metrics']['recall']}")
        print(f"F1 Score: {metrics['metrics']['f1Score']}")

        print("\nFeature Importance:")
        for feature in metrics["feature_importance"]:
            print(f"- {feature['feature']}: {feature['importance']:.4f}")

        return model_path

    except Exception as e:
        print(f"Error during training: {str(e)}")
        return None


if __name__ == "__main__":
    trained_model_path = train_model()
    if trained_model_path:
        print("\nModel training completed successfully!")
