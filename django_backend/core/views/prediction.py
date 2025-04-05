from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
from core.models import Prediction
from core.serializers import PredictionSerializer
from ml.prediction import generate_prediction
from ml.models import CropModel
import os
import pickle
from django.conf import settings


@api_view(["POST"])
def predict_crop(request):
    return Response(
        {"prediction": "Wheat", "confidence": 0.92, "alternatives": ["Rice", "Maize"]}
    )


@api_view(["GET"])
def get_predictions(request):
    return Response(
        {
            "predictions": [
                {"id": 1, "crop": "Wheat", "confidence": 0.92, "date": "2024-03-25"}
            ]
        }
    )


class PredictionView(APIView):
    def post(self, request):
        try:
            # Extract soil parameters
            soil_params = {
                "nitrogen": request.data.get("N"),
                "phosphorus": request.data.get("P"),
                "potassium": request.data.get("K"),
                "ph": request.data.get("pH"),
            }

            # Extract environmental parameters
            env_params = {
                "temperature": request.data.get("temperature"),
                "rainfall": request.data.get("rainfall"),
                "humidity": request.data.get("humidity"),
            }

            # Validate required parameters
            required_params = [
                "N",
                "P",
                "K",
                "pH",
                "temperature",
                "rainfall",
                "humidity",
            ]
            missing_params = [
                param for param in required_params if request.data.get(param) is None
            ]
            if missing_params:
                return Response(
                    {
                        "error": f"Missing required parameters: {', '.join(missing_params)}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Generate prediction
            prediction_result = generate_prediction(soil_params, env_params)
            if prediction_result is None:
                return Response(
                    {"error": "Failed to generate prediction"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(prediction_result, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
