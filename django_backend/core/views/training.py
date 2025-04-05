from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import Dataset, TrainedModel
from core.serializers import DatasetSerializer, TrainedModelSerializer
from ml.training import train_model
from ml.utils import DATASET_PATH
import pandas as pd
import os
from datetime import datetime


class DatasetUploadView(APIView):
    def post(self, request):
        try:
            file = request.FILES.get("dataset")
            if not file:
                return Response(
                    {"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Validate file type
            if not file.name.endswith(".csv"):
                return Response(
                    {"error": "Only CSV files are supported"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Read and validate dataset
            try:
                df = pd.read_csv(file)
            except Exception as e:
                return Response(
                    {"error": f"Invalid CSV file: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Ensure the dataset directory exists
            os.makedirs(DATASET_PATH, exist_ok=True)
            print(f"Dataset directory path: {DATASET_PATH}")  # Debug log

            # Generate a unique filename to avoid conflicts
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_filename = f"{timestamp}_{file.name}"
            file_path = os.path.join(DATASET_PATH, unique_filename)
            print(f"Full file path: {file_path}")  # Debug log

            # Save the file to the dataset directory
            with open(file_path, "wb+") as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            # Create dataset record with absolute path
            dataset = Dataset.objects.create(
                name=file.name,
                file_path=file_path,  # Store absolute path
                columns=df.columns.tolist(),
                row_count=len(df),
            )

            # Return response with both relative and absolute paths
            response_data = {
                "name": file.name,
                "file_path": file_path,  # Return absolute path
                "relative_path": os.path.join("sample_datasets", unique_filename),
                "columns": df.columns.tolist(),
                "row_count": len(df),
                "created_at": dataset.created_at,
                "dataset_id": str(dataset.id),  # Return MongoDB document ID
            }
            print(f"Response data: {response_data}")  # Debug log
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error in dataset upload: {str(e)}")  # Debug log
            return Response(
                {"error": f"Error processing dataset: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ModelTrainingView(APIView):
    def post(self, request):
        print("Received training request:", request.data)  # Debug log

        dataset_id = request.data.get("dataset_id")
        algorithm = request.data.get("algorithm")

        if not dataset_id:
            print("Missing dataset_id")  # Debug log
            return Response(
                {"error": "Dataset ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not algorithm:
            print("Missing algorithm")  # Debug log
            return Response(
                {"error": "Algorithm is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        print(
            f"Starting training with dataset ID: {dataset_id}, algorithm: {algorithm}"
        )  # Debug log

        try:
            # Get dataset from MongoDB
            dataset = Dataset.objects.get(id=dataset_id)
            print(f"Found dataset: {dataset.name} at {dataset.file_path}")  # Debug log

            # Train model using the absolute file path
            model_metrics = train_model(algorithm, dataset.file_path)

            if not model_metrics.get("success", False):
                raise Exception(model_metrics.get("error", "Training failed"))

            # Save trained model
            model = TrainedModel(
                name=f"{algorithm}_{dataset.name}",
                algorithm=algorithm,
                metrics=model_metrics,
                file_path=model_metrics["model_path"],
            ).save()

            serializer = TrainedModelSerializer(model)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Dataset.DoesNotExist:
            print(f"Dataset not found with ID: {dataset_id}")  # Debug log
            return Response(
                {"error": "Dataset not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            print(f"Training error: {str(e)}")  # Debug log
            return Response(
                {"error": f"Training failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
