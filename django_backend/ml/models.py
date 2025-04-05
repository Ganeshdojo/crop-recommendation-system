from django.db import models
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from imblearn.over_sampling import SMOTE
from django.conf import settings


# Add progress tracking function
def save_progress(model_id, stage, progress):
    """Save training progress to a JSON file"""
    import json
    from .utils import MODELS_PATH

    progress_file = os.path.join(MODELS_PATH, f"{model_id}_progress.json")
    progress_data = {"stage": stage, "progress": progress}
    os.makedirs(MODELS_PATH, exist_ok=True)
    with open(progress_file, "w") as f:
        json.dump(progress_data, f)


# Create your models here.


class CropModel:
    """Base class for crop recommendation models"""

    def __init__(self, algorithm="random_forest"):
        self.algorithm = algorithm
        self.model = None
        self.features = ["N", "P", "K", "pH", "temperature", "rainfall", "humidity"]
        self.target = "crop"
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.fitted_labels = None

    def train(self, X, y):
        """Train the model with the given data"""
        try:
            print(f"Starting model training with algorithm: {self.algorithm}")
            print(f"Input features shape: {X.shape}")
            print(f"Target labels shape: {y.shape}")

            # Convert all crop names to lowercase for consistency
            y = y.str.lower()
            print(f"Unique crops in training set: {sorted(y.unique())}")

            # Only fit label encoder if it hasn't been fitted yet
            if not hasattr(self.label_encoder, "classes_"):
                unique_crops = sorted(y.unique())
                self.label_encoder.fit(unique_crops)
                self.fitted_labels = unique_crops
                print(f"Label encoder fitted with {len(unique_crops)} unique crops")
            else:
                print(
                    f"Using pre-fitted label encoder with {len(self.label_encoder.classes_)} crops"
                )

            # Transform target using fitted encoder
            y_encoded = self.label_encoder.transform(y)
            print(f"Encoded labels shape: {y_encoded.shape}")

            # Scale features
            print("Scaling features...")
            X_scaled = self.scaler.fit_transform(X)
            print(f"Scaled features shape: {X_scaled.shape}")

            # Get actual classes present in this dataset and create mapping
            present_classes = np.unique(y_encoded)
            n_classes = len(present_classes)
            print(f"Number of classes present in training data: {n_classes}")

            # Create mapping for consecutive labels (needed for XGBoost)
            label_mapping = {
                old_label: new_label
                for new_label, old_label in enumerate(sorted(present_classes))
            }
            print(f"Created label mapping for {len(label_mapping)} classes")

            # Apply mapping to get consecutive labels
            y_consecutive = np.array([label_mapping[label] for label in y_encoded])
            print(
                f"Converted to consecutive labels (min={y_consecutive.min()}, max={y_consecutive.max()})"
            )

            # Check class distribution
            class_counts = pd.Series(y_consecutive).value_counts()
            min_samples = class_counts.min()
            print(f"Minimum samples per class: {min_samples}")

            # Try to apply SMOTE if we have enough samples
            X_balanced = X_scaled
            y_balanced = y_consecutive
            try:
                if min_samples >= 5:  # Only apply SMOTE if we have enough samples
                    print("Applying SMOTE for class balancing...")
                    smote = SMOTE(random_state=42, k_neighbors=min(5, min_samples - 1))
                    X_balanced, y_balanced = smote.fit_resample(X_scaled, y_consecutive)
                    print(
                        f"Balanced data shapes - X: {X_balanced.shape}, y: {y_balanced.shape}"
                    )
                else:
                    print("Skipping SMOTE due to insufficient samples per class")
            except Exception as e:
                print(f"SMOTE failed, using original data: {str(e)}")

            # Initialize model based on algorithm with appropriate parameters for multi-class
            print(f"Initializing {self.algorithm} model...")
            if self.algorithm == "random_forest":
                # Calculate class weights for present classes only
                weights = {}
                for label in np.unique(y_balanced):
                    weights[label] = 1.0 / (class_counts.get(label, 1) + 1)

                self.model = RandomForestClassifier(
                    n_estimators=100,  # Reduced trees for faster training
                    max_depth=None,  # Let trees grow fully
                    min_samples_split=2,
                    min_samples_leaf=1,
                    random_state=42,
                    class_weight=weights,
                    n_jobs=-1,  # Use all CPU cores
                )
            elif self.algorithm == "xgboost":
                # Calculate sample weights
                sample_weights = np.zeros(len(y_balanced))
                for i, y_val in enumerate(y_balanced):
                    sample_weights[i] = 1.0 / (class_counts.get(y_val, 1) + 1)

                # Normalize weights
                sample_weights = (
                    sample_weights / sample_weights.sum() * len(sample_weights)
                )

                self.model = XGBClassifier(
                    n_estimators=100,  # Reduced trees for faster training
                    max_depth=None,  # Let trees grow fully
                    learning_rate=0.1,
                    random_state=42,
                    n_jobs=-1,  # Use all CPU cores
                    objective="multi:softprob",
                    eval_metric="mlogloss",
                    num_class=len(
                        np.unique(y_balanced)
                    ),  # Set number of classes explicitly
                )
            else:
                raise ValueError(f"Unsupported algorithm: {self.algorithm}")

            # Store label mapping for predictions
            self.label_mapping = label_mapping
            self.reverse_mapping = {new: old for old, new in label_mapping.items()}

            # Train the model
            print("Training model...")
            if self.algorithm == "xgboost":
                self.model.fit(X_balanced, y_balanced, sample_weight=sample_weights)
            else:
                self.model.fit(X_balanced, y_balanced)
            print("Model training completed successfully")

            # Verify the model works by making a test prediction
            print("Verifying model with test prediction...")
            test_pred = self.model.predict(X_scaled[:1])
            if self.algorithm == "xgboost":
                # Map prediction back to original label
                test_pred = np.array([self.reverse_mapping[pred] for pred in test_pred])
            print(
                f"Test prediction successful: {self.label_encoder.inverse_transform(test_pred)[0]}"
            )

            return True
        except Exception as e:
            import traceback

            print(f"Error in model training: {str(e)}")
            print("Full traceback:")
            print(traceback.format_exc())
            return False

    def predict(self, X):
        """Make predictions with the trained model"""
        try:
            if self.model is None:
                raise ValueError("Model has not been trained")

            # Ensure X has the correct features in the correct order
            if isinstance(X, pd.DataFrame):
                X = X[self.features]

            # Scale features
            X_scaled = self.scaler.transform(X)

            # Make predictions
            predictions = self.model.predict(X_scaled)
            probabilities = self.model.predict_proba(X_scaled)

            # Map predictions back to original labels for XGBoost
            if self.algorithm == "xgboost":
                predictions = np.array(
                    [self.reverse_mapping[pred] for pred in predictions]
                )

            # Get top prediction
            top_crop_idx = predictions[0]
            top_crop = self.label_encoder.inverse_transform([top_crop_idx])[0]

            # For XGBoost, map the index to get correct probability
            if self.algorithm == "xgboost":
                confidence = probabilities[0][self.label_mapping[top_crop_idx]]
            else:
                confidence = probabilities[0][top_crop_idx]

            # Get alternative crops (top 5 predictions)
            crop_matches = []
            for i, prob in enumerate(probabilities[0]):
                if self.algorithm == "xgboost":
                    # Map the consecutive index back to original label
                    orig_idx = self.reverse_mapping.get(i)
                    if orig_idx is not None:  # Only add if we have a mapping
                        crop = self.label_encoder.inverse_transform([orig_idx])[0]
                        crop_matches.append({"crop": crop, "confidence": float(prob)})
                else:
                    crop = self.label_encoder.inverse_transform([i])[0]
                    crop_matches.append({"crop": crop, "confidence": float(prob)})

            # Sort by confidence and get top matches
            crop_matches.sort(key=lambda x: x["confidence"], reverse=True)
            crop_matches = crop_matches[:5]  # Keep only top 5 alternatives

            return {
                "top_crop": {"crop": top_crop, "confidence": float(confidence)},
                "crop_matches": crop_matches,
            }
        except Exception as e:
            print(f"Error making prediction: {str(e)}")
            return None

    def save(self, path):
        """Save the model to disk"""
        try:
            with open(path, "wb") as f:
                pickle.dump(self, f)
            return True
        except Exception as e:
            print(f"Error saving model: {str(e)}")
            return False

    @classmethod
    def load(cls, path):
        """Load a model from disk"""
        try:
            with open(path, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return None
