from django.urls import path
from .views.prediction import PredictionView
from .views.training import DatasetUploadView, ModelTrainingView

urlpatterns = [
    path("predictions/", PredictionView.as_view()),
    path("datasets/upload/", DatasetUploadView.as_view()),
    path("models/train/", ModelTrainingView.as_view()),
]
