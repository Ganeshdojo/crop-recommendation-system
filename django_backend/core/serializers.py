from rest_framework import serializers


class PredictionSerializer(serializers.Serializer):
    soil_params = serializers.DictField()
    env_params = serializers.DictField()
    results = serializers.DictField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class TrainedModelSerializer(serializers.Serializer):
    name = serializers.CharField()
    algorithm = serializers.CharField()
    metrics = serializers.DictField()
    created_at = serializers.DateTimeField(read_only=True)


class DatasetSerializer(serializers.Serializer):
    name = serializers.CharField()
    columns = serializers.ListField(child=serializers.CharField())
    row_count = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True)
