import os
import pickle
from ml.models import CropModel

# Load the model
model_path = os.path.join("ml", "models", "default_model.pkl")
print(f"Loading model from {model_path}")

with open(model_path, "rb") as f:
    model = pickle.load(f)

print(f"Model type: {type(model)}")
print(f"Model attributes: {dir(model)}")

# Try making a prediction
import pandas as pd

input_data = pd.DataFrame(
    [
        {
            "N": 75,
            "P": 45,
            "K": 80,
            "pH": 6.5,
            "temperature": 21,
            "rainfall": 95,
            "humidity": 65,
        }
    ]
)

print("\nMaking prediction...")
prediction = model.predict(input_data)
print(f"Prediction result: {prediction}")
