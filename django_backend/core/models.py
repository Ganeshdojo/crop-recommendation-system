from django.db import models
from mongoengine import (
    Document,
    StringField,
    FloatField,
    DateTimeField,
    ListField,
    DictField,
    IntField,
)

from datetime import datetime

# Create your models here.


class Prediction(Document):
    user_id = StringField(required=False, default="anonymous")
    soil_params = DictField(required=True)
    env_params = DictField(required=True)
    results = DictField(required=True)
    created_at = DateTimeField(default=datetime.now)


class TrainedModel(Document):
    name = StringField(required=True)
    algorithm = StringField(required=True)
    metrics = DictField(required=True)
    file_path = StringField(required=True)
    created_at = DateTimeField(default=datetime.now)


class Dataset(Document):
    name = StringField(required=True)
    file_path = StringField(required=True)
    columns = ListField(StringField())
    row_count = IntField()
    created_at = DateTimeField(default=datetime.now)
