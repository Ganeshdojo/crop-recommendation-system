from django.urls import path
from . import views

urlpatterns = [
    path(
        "models/<str:model_id>/status/",
        views.get_training_status,
        name="training_status",
    ),
    path(
        "models/<str:model_id>/",
        views.get_model,
        name="get_model",
    ),
    path("predict/", views.predict, name="predict"),
]
