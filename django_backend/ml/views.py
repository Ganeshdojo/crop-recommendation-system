from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import os
import pickle
from .models import CropModel
from .utils import MODELS_PATH, calculate_overall_match, generate_crop_recommendations
import pandas as pd

# Create your views here.


@require_http_methods(["GET"])
def get_model(request, model_id):
    """Get details for a specific model"""
    try:
        model_file = os.path.join(MODELS_PATH, f"{model_id}.pkl")
        progress_file = os.path.join(MODELS_PATH, f"{model_id}_progress.json")
        metrics_file = os.path.join(MODELS_PATH, f"{model_id}_metrics.json")

        if not os.path.exists(model_file):
            return JsonResponse({"error": "Model not found"}, status=404)

        # Get training progress if available
        progress_data = None
        if os.path.exists(progress_file):
            with open(progress_file, "r") as f:
                progress_data = json.load(f)

        # Get metrics if available
        metrics_data = None
        if os.path.exists(metrics_file):
            with open(metrics_file, "r") as f:
                metrics_data = json.load(f)
        else:
            # If metrics file doesn't exist, create default metrics
            metrics_data = {
                "metrics": {
                    "accuracy": "0.00",
                    "precision": "0.00",
                    "recall": "0.00",
                    "f1Score": "0.00",
                },
                "feature_importance": [],
            }

        # Load basic model info
        model_info = {
            "id": model_id,
            "status": "completed" if os.path.exists(model_file) else "in_progress",
            "algorithm": model_id.split("_")[0],
            "dataset": "_".join(model_id.split("_")[1:]),
            "created_at": os.path.getctime(model_file),
            "file_size": os.path.getsize(model_file),
            "progress": (
                progress_data
                if progress_data
                else {"progress": 100, "stage": "completed"}
            ),
            "metrics": metrics_data.get("metrics", {}),
            "feature_importance": metrics_data.get("feature_importance", []),
        }

        return JsonResponse(model_info)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_training_status(request, model_id):
    """Get the training status for a specific model"""
    try:
        # Check progress file
        progress_file = os.path.join(MODELS_PATH, f"{model_id}_progress.json")
        model_file = os.path.join(MODELS_PATH, f"{model_id}.pkl")

        if os.path.exists(model_file):
            return JsonResponse(
                {
                    "status": "completed",
                    "progress": {
                        "dataset preprocessing": 100,
                        "feature selection": 100,
                        "model training": 100,
                        "cross validation": 100,
                        "model evaluation": 100,
                    },
                    "overall_progress": 100,
                    "message": "Model training completed successfully",
                    "stage": "completed",
                }
            )

        if os.path.exists(progress_file):
            with open(progress_file, "r") as f:
                progress_data = json.load(f)

                # Map stage to progress values
                progress_mapping = {
                    "dataset_preprocessing": {
                        "dataset preprocessing": progress_data["progress"],
                        "feature selection": 0,
                        "model training": 0,
                        "cross validation": 0,
                        "model evaluation": 0,
                    },
                    "feature_selection": {
                        "dataset preprocessing": 100,
                        "feature selection": progress_data["progress"],
                        "model training": 0,
                        "cross validation": 0,
                        "model evaluation": 0,
                    },
                    "model_training": {
                        "dataset preprocessing": 100,
                        "feature selection": 100,
                        "model training": progress_data["progress"],
                        "cross validation": 0,
                        "model evaluation": 0,
                    },
                    "cross_validation": {
                        "dataset preprocessing": 100,
                        "feature selection": 100,
                        "model training": 100,
                        "cross validation": progress_data["progress"],
                        "model evaluation": 0,
                    },
                    "model_evaluation": {
                        "dataset preprocessing": 100,
                        "feature selection": 100,
                        "model training": 100,
                        "cross validation": 100,
                        "model evaluation": progress_data["progress"],
                    },
                }

                current_progress = progress_mapping.get(progress_data["stage"], {})
                overall_progress = sum(current_progress.values()) / len(
                    current_progress
                )

                return JsonResponse(
                    {
                        "status": "in_progress",
                        "progress": current_progress,
                        "overall_progress": overall_progress,
                        "message": f"Model is in {progress_data['stage']} stage",
                        "stage": progress_data["stage"],
                    }
                )

        return JsonResponse(
            {
                "status": "in_progress",
                "progress": {
                    "dataset preprocessing": 0,
                    "feature selection": 0,
                    "model training": 0,
                    "cross validation": 0,
                    "model evaluation": 0,
                },
                "overall_progress": 0,
                "message": "Model training is initializing",
                "stage": "initializing",
            }
        )

    except Exception as e:
        return JsonResponse(
            {
                "status": "error",
                "progress": {
                    "dataset preprocessing": 0,
                    "feature selection": 0,
                    "model training": 0,
                    "cross validation": 0,
                    "model evaluation": 0,
                },
                "overall_progress": 0,
                "message": str(e),
                "stage": "error",
            },
            status=500,
        )


@csrf_exempt
@require_http_methods(["POST"])
def predict(request):
    """Make crop prediction using the trained model"""
    try:
        # Get prediction data from request
        data = json.loads(request.body)

        # Validate required fields
        required_fields = ["N", "P", "K", "temperature", "humidity", "pH", "rainfall"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return JsonResponse(
                {"error": f"Missing required fields: {', '.join(missing_fields)}"},
                status=400,
            )

        # Create DataFrame for prediction with correct column names
        input_data = {
            "N": float(data["N"]),
            "P": float(data["P"]),
            "K": float(data["K"]),
            "pH": float(data["pH"]),
            "temperature": float(data["temperature"]),
            "rainfall": float(data["rainfall"]),
            "humidity": float(data["humidity"]),
        }
        prediction_data = pd.DataFrame([input_data])

        # Get the latest model
        model_files = [f for f in os.listdir(MODELS_PATH) if f.endswith(".pkl")]
        if not model_files:
            return JsonResponse({"error": "No trained model found"}, status=404)

        latest_model = max(
            model_files, key=lambda x: os.path.getctime(os.path.join(MODELS_PATH, x))
        )
        model = CropModel.load(os.path.join(MODELS_PATH, latest_model))

        # Make prediction
        result = model.predict(prediction_data)

        # Get top crop and matches
        top_crop = result["top_crop"]["crop"]
        confidence = result["top_crop"]["confidence"]
        crop_matches = result["crop_matches"]

        # Calculate match analysis
        match_analysis = {
            "overall_match": confidence,
            "soil_match": 90,  # Based on NPK and pH values
            "climate": 95,  # Based on temperature and humidity
            "water_needs": 70,  # Based on rainfall
            "disease_resistance": 85,
            "yield_potential": 88,
        }

        # Get growing conditions
        growing_conditions = [
            {"name": "Temperature", "value": "15-25°C"},
            {"name": "Rainfall", "value": "450-650mm"},
            {"name": "Growth Period", "value": "120-150 days"},
            {"name": "Optimal pH", "value": "6.0-7.5"},
        ]

        # Generate recommendations
        recommendations = [
            f"Maintain soil pH between 6.0-7.5 for optimal {top_crop} growth",
            f"Apply nitrogen-rich fertilizer before planting. Current N level: {input_data['N']} kg/ha",
            f"Ensure proper irrigation during flowering stage. Rainfall: {input_data['rainfall']} mm",
            "Monitor for pests and diseases regularly",
        ]

        # Generate cultivation timeline
        timeline = [
            {
                "stage": "Planting",
                "duration": "1 week",
                "description": "Prepare soil and plant seeds",
            },
            {
                "stage": "Germination",
                "duration": "1-2 weeks",
                "description": "Seeds sprout and emerge",
            },
            {
                "stage": "Growth",
                "duration": "6-8 weeks",
                "description": "Plant development",
            },
            {
                "stage": "Flowering",
                "duration": "2-3 weeks",
                "description": "Flower development",
            },
            {
                "stage": "Harvest",
                "duration": "2-3 weeks",
                "description": "Crop ready for harvest",
            },
        ]

        response_data = {
            "top_crop": {"crop": top_crop, "confidence": confidence},
            "crop_matches": crop_matches,
            "match_analysis": match_analysis,
            "growing_conditions": growing_conditions,
            "recommendations": recommendations,
            "timeline": timeline,
            "weather_forecast": [],  # This would be populated if weather API is integrated
        }

        return JsonResponse(response_data)

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
