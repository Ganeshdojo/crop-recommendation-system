# django_backend/core/management/commands/test_ml.py
from django.core.management.base import BaseCommand
import pandas as pd

from ml.models import RandomForestModel, XGBoostModel
from ml.prediction import generate_prediction
from ml.training import train_model, validate_dataset

class Command(BaseCommand):
    help = 'Tests ML implementation components'

    def add_arguments(self, parser):
        parser.add_argument('--component', type=str, help='Component to test (model, prediction, training, all)')

    def handle(self, *args, **options):
        component = options.get('component', 'all')
        
        if component in ['model', 'all']:
            self.test_models()
        
        if component in ['prediction', 'all']:
            self.test_prediction()
            
        if component in ['training', 'all']:
            self.test_training()
    
    def test_models(self):
        self.stdout.write(self.style.SUCCESS("Testing ML Models..."))
        try:
            # Test Random Forest
            model = RandomForestModel()
            self.stdout.write("  Random Forest model initialized")
            
            # Test XGBoost
            model = XGBoostModel()
            self.stdout.write("  XGBoost model initialized")
            
            self.stdout.write(self.style.SUCCESS("ML Models test successful"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"ML Models test failed: {str(e)}"))
    
    def test_prediction(self):
        self.stdout.write(self.style.SUCCESS("Testing Prediction Pipeline..."))
        try:
            soil_params = {
                'nitrogen': 90,
                'phosphorus': 42,
                'potassium': 43,
                'ph': 6.5
            }
            env_params = {
                'temperature': 20.8,
                'humidity': 82,
                'rainfall': 200
            }
            
            prediction = generate_prediction(soil_params, env_params)
            
            self.stdout.write(f"  Top crop: {prediction.get('top_crop', {}).get('crop', 'None')}")
            self.stdout.write(f"  Alternatives: {[c['name'] for c in prediction.get('crop_matches', [])]}")
            self.stdout.write(self.style.SUCCESS("Prediction Pipeline test successful"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Prediction Pipeline test failed: {str(e)}"))
    
    def test_training(self):
        self.stdout.write(self.style.SUCCESS("Testing Training Pipeline..."))
        try:
            from django.conf import settings
            import os
            
            sample_path = os.path.join(settings.BASE_DIR, "data", "sample_datasets", "Crop_recommendation_data.csv")
            
            # Validate dataset
            valid_result = validate_dataset(sample_path)
            self.stdout.write(f"  Dataset validation: {valid_result.get('success', False)}")
            
            if valid_result.get('success', False):
                # Train model
                result = train_model("randomforest", sample_path)
                self.stdout.write(f"  Training success: {result.get('success', False)}")
                self.stdout.write(f"  Metrics: {result.get('metrics', {})}")
                
                self.stdout.write(self.style.SUCCESS("Training Pipeline test successful"))
            else:
                self.stdout.write(self.style.ERROR(f"Dataset validation failed: {valid_result.get('error', 'Unknown error')}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Training Pipeline test failed: {str(e)}"))