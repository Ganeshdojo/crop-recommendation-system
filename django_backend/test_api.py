import requests
import json
import os

BASE_URL = "http://localhost:8000/api"


def test_prediction_api():
    """Test the prediction API endpoint"""
    print("Testing prediction API...")
    payload = {
        "soil_params": {"nitrogen": 75, "phosphorus": 45, "potassium": 80, "ph": 6.5},
        "env_params": {"temperature": 21, "rainfall": 95, "humidity": 65},
    }

    try:
        response = requests.post(f"{BASE_URL}/predictions/", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("Prediction API test successful!")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Prediction API test failed!")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")


def test_dataset_upload_api():
    """Test the dataset upload API endpoint with a mock CSV file"""
    print("\nTesting dataset upload API...")

    # Create a mock CSV file
    mock_csv_content = """N,P,K,pH,temperature,rainfall,humidity,crop
75,45,80,6.5,21,95,65,wheat
80,50,70,6.2,22,105,70,rice
60,30,65,5.8,25,80,60,maize
"""

    mock_file_path = "mock_dataset.csv"

    # Check if file already exists and remove it
    if os.path.exists(mock_file_path):
        try:
            os.remove(mock_file_path)
        except PermissionError:
            print(
                f"Warning: Could not remove existing {mock_file_path} - file may be in use"
            )
            mock_file_path = "mock_dataset_new.csv"  # Use alternative filename

    with open(mock_file_path, "w") as f:
        f.write(mock_csv_content)

    try:
        with open(mock_file_path, "rb") as file_obj:
            files = {"dataset": file_obj}
            response = requests.post(f"{BASE_URL}/datasets/upload/", files=files)
            print(f"Status: {response.status_code}")
            if response.status_code == 201:
                print("Dataset upload API test successful!")
                print(json.dumps(response.json(), indent=2))
            else:
                print("Dataset upload API test failed!")
                print(response.text)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Clean up - file should be closed by now
        if os.path.exists(mock_file_path):
            try:
                os.remove(mock_file_path)
            except PermissionError:
                print(
                    f"Warning: Could not remove {mock_file_path} - file may still be in use"
                )


def test_model_training_api():
    """Test the model training API endpoint"""
    print("\nTesting model training API...")

    payload = {"dataset_id": "mock_dataset_id", "algorithm": "randomForest"}

    try:
        response = requests.post(f"{BASE_URL}/models/train/", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("Model training API test successful!")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Model training API test failed!")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    print("API Testing Script")
    print("=================")
    test_prediction_api()
    test_model_training_api()
    test_dataset_upload_api()
