import pandas as pd
import numpy as np
from typing import List, Dict
import random

# List of valid crops
CROPS = [
    "amaranthus",
    "amla",
    "amorphophallus",
    "amphophalus",
    "apple",
    "arecanut",
    "ashgourd",
    "bajra",
    "banana",
    "barley",
    "beans",
    "beetroot",
    "bengalgram",
    "betalleaves",
    "bittergourd",
    "blackgram",
    "blackpepper",
    "bottlegourd",
    "brinjal",
    "brokenrice",
    "cabbage",
    "capsicum",
    "carrot",
    "cashewnuts",
    "castorseed",
    "cauliflower",
    "chanadal",
    "chholia",
    "chickpea",
    "chillycapsicum",
    "clusterbeans",
    "coconut",
    "coconutoil",
    "coconutseed",
    "coffee",
    "colacasia",
    "copra",
    "coriander",
    "corrianderseed",
    "cotton",
    "cowpea",
    "cucumber",
    "cumbu",
    "drumstick",
    "drychillies",
    "dusterbeans",
    "elephantyam",
    "elephatyam",
    "fieldpea",
    "fish",
    "frenchbeans",
    "garlic",
    "ghee",
    "gingellyoil",
    "ginger",
    "grapes",
    "greenavare",
    "greenbanana",
    "greenchilli",
    "greengram",
    "greenonion",
    "greenpeas",
    "groundnut",
    "groundnutseed",
    "guar",
    "guava",
    "horsegram",
    "hybridcumbu",
    "jaggery",
    "jowar",
    "jute",
    "karamani",
    "kidneybeans",
    "kinnow",
    "knoolkhol",
    "ladiesfinger",
    "leafyvegetable",
    "lemon",
    "lentil",
    "lime",
    "linseed",
    "littlegourd",
    "longmelon",
    "maidaatta",
    "maize",
    "mango",
    "masurdal",
    "methileaves",
    "mint",
    "moathdal",
    "moongdal",
    "mothbeans",
    "mungbean",
    "mushrooms",
    "muskmelon",
    "mustard",
    "mustardoil",
    "nigerseed",
    "onion",
    "orange",
    "paddy",
    "papaya",
    "parval",
    "pear",
    "peas",
    "peascod",
    "peppergarbled",
    "pigeonpea",
    "pigeonpeas",
    "pineapple",
    "plum",
    "pomegranate",
    "potato",
    "pumpkin",
    "raddish",
    "ragi",
    "rajgir",
    "redgram",
    "rice",
    "ridgegourd",
    "roundgourd",
    "rubber",
    "sapota",
    "seam",
    "seemebadnekai",
    "sesamum",
    "snakeguard",
    "soyabean",
    "spinach",
    "spongegourd",
    "squash",
    "sugar",
    "suratbeans",
    "suvarnagadde",
    "sweetlime",
    "sweetpotato",
    "sweetpumpkin",
    "tamarindfruit",
    "tapioca",
    "taramira",
    "tendercoconut",
    "thinai",
    "tinda",
    "tobacco",
    "tomato",
    "turdal",
    "turmeric",
    "turnip",
    "urddal",
    "varagu",
    "watermelon",
    "wheat",
    "wheatatta",
    "whitepumpkin",
    "wood",
    "zizyphus",
]

# Indian states
STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
]

# Soil types
SOIL_TYPES = [
    "Alluvial Soil",
    "Black Soil",
    "Red Soil",
    "Laterite Soil",
    "Desert Soil",
    "Mountain Soil",
    "Coastal Soil",
    "Peaty Soil",
    "Saline Soil",
    "Forest Soil",
]


def generate_base_values(num_rows: int) -> Dict[str, np.ndarray]:
    """Generate base values for common parameters."""
    return {
        "N": np.random.uniform(60, 100, num_rows).round(0),
        "P": np.random.uniform(35, 60, num_rows).round(0),
        "K": np.random.uniform(15, 45, num_rows).round(0),
        "temperature": np.random.uniform(18, 27, num_rows).round(8),
        "humidity": np.random.uniform(55, 85, num_rows).round(8),
        "pH": np.random.uniform(5.0, 8.0, num_rows).round(8),
        "rainfall": np.random.uniform(60, 300, num_rows).round(8),
    }


def get_realistic_crop_price(crop: str) -> float:
    """Get a realistic crop price based on the crop type."""
    base_prices = {
        "rice": (1500, 3000),
        "wheat": (1800, 3500),
        "maize": (1600, 3000),
        "potato": (800, 2000),
        "tomato": (1000, 2500),
        "onion": (1200, 3000),
        "cotton": (4000, 6000),
        "sugarcane": (2500, 4000),
        "coffee": (15000, 25000),
        "tea": (20000, 30000),
        "spices": (5000, 15000),
        "fruits": (3000, 8000),
        "vegetables": (1000, 3000),
    }

    # Categorize the crop
    if crop in ["rice", "paddy", "brokenrice"]:
        price_range = base_prices["rice"]
    elif crop in ["wheat", "wheatatta"]:
        price_range = base_prices["wheat"]
    elif crop in ["maize", "corn"]:
        price_range = base_prices["maize"]
    elif crop in ["potato", "sweetpotato"]:
        price_range = base_prices["potato"]
    elif crop in ["tomato"]:
        price_range = base_prices["tomato"]
    elif crop in ["onion", "greenonion"]:
        price_range = base_prices["onion"]
    elif crop in ["cotton"]:
        price_range = base_prices["cotton"]
    elif crop in ["sugar", "sugarcane"]:
        price_range = base_prices["sugarcane"]
    elif crop in ["coffee"]:
        price_range = base_prices["coffee"]
    elif crop in ["tea"]:
        price_range = base_prices["tea"]
    elif crop in ["blackpepper", "ginger", "turmeric", "garlic"]:
        price_range = base_prices["spices"]
    elif crop in ["apple", "mango", "banana", "grapes", "orange", "pomegranate"]:
        price_range = base_prices["fruits"]
    else:
        price_range = base_prices["vegetables"]

    return round(random.uniform(*price_range), 2)


def get_realistic_yield(crop: str) -> float:
    """Get a realistic yield value based on the crop type."""
    base_yields = {
        "rice": (2000, 6000),
        "wheat": (2500, 5000),
        "maize": (2000, 4500),
        "potato": (15000, 25000),
        "tomato": (20000, 40000),
        "onion": (15000, 30000),
        "cotton": (1500, 3000),
        "sugarcane": (50000, 100000),
        "coffee": (1000, 2000),
        "tea": (1500, 3000),
        "spices": (1000, 3000),
        "fruits": (15000, 30000),
        "vegetables": (10000, 25000),
    }

    # Categorize the crop similar to price categorization
    if crop in ["rice", "paddy", "brokenrice"]:
        yield_range = base_yields["rice"]
    elif crop in ["wheat", "wheatatta"]:
        yield_range = base_yields["wheat"]
    elif crop in ["maize", "corn"]:
        yield_range = base_yields["maize"]
    elif crop in ["potato", "sweetpotato"]:
        yield_range = base_yields["potato"]
    elif crop in ["tomato"]:
        yield_range = base_yields["tomato"]
    elif crop in ["onion", "greenonion"]:
        yield_range = base_yields["onion"]
    elif crop in ["cotton"]:
        yield_range = base_yields["cotton"]
    elif crop in ["sugar", "sugarcane"]:
        yield_range = base_yields["sugarcane"]
    elif crop in ["coffee"]:
        yield_range = base_yields["coffee"]
    elif crop in ["tea"]:
        yield_range = base_yields["tea"]
    elif crop in ["blackpepper", "ginger", "turmeric", "garlic"]:
        yield_range = base_yields["spices"]
    elif crop in ["apple", "mango", "banana", "grapes", "orange", "pomegranate"]:
        yield_range = base_yields["fruits"]
    else:
        yield_range = base_yields["vegetables"]

    return round(random.uniform(*yield_range), 2)


def create_dataset1(num_rows: int = 4000):
    """Create dataset 1: NPK, pH, temperature, humidity, rainfall, crop"""
    data = generate_base_values(num_rows)
    data["crop"] = np.random.choice(CROPS, num_rows)
    return pd.DataFrame(data)


def create_dataset2(num_rows: int = 2000):
    """Create dataset 2: state, NPK, pH, temperature, humidity, rainfall, crop"""
    data = generate_base_values(num_rows)
    data["state"] = np.random.choice(STATES, num_rows)
    data["crop"] = np.random.choice(CROPS, num_rows)
    return pd.DataFrame(data)


def create_dataset3(num_rows: int = 3500):
    """Create dataset 3: NPK, pH, temperature, humidity, rainfall, crop"""
    data = generate_base_values(num_rows)
    data["crop"] = np.random.choice(CROPS, num_rows)
    return pd.DataFrame(data)


def create_dataset4(num_rows: int = 10000):
    """Create dataset 4: NPK, pH, temperature, humidity, rainfall, crop, yield"""
    data = generate_base_values(num_rows)
    data["crop"] = np.random.choice(CROPS, num_rows)
    data["yield"] = [get_realistic_yield(crop) for crop in data["crop"]]
    return pd.DataFrame(data)


def create_dataset5(num_rows: int = 5000):
    """Create dataset 5: state, soiltype, NPK, pH, temperature, humidity, rainfall, cropprice, crop"""
    data = generate_base_values(num_rows)
    data["state"] = np.random.choice(STATES, num_rows)
    data["soil_type"] = np.random.choice(SOIL_TYPES, num_rows)
    data["crop"] = np.random.choice(CROPS, num_rows)
    data["crop_price"] = [get_realistic_crop_price(crop) for crop in data["crop"]]
    return pd.DataFrame(data)


if __name__ == "__main__":
    # Create datasets
    dataset1 = create_dataset1()
    dataset2 = create_dataset2()
    dataset3 = create_dataset3()
    dataset4 = create_dataset4()
    dataset5 = create_dataset5()

    # Save datasets
    dataset1.to_csv("datasets/crop_data_1.csv", index=False)
    dataset2.to_csv("datasets/crop_data_2.csv", index=False)
    dataset3.to_csv("datasets/crop_data_3.csv", index=False)
    dataset4.to_csv("datasets/crop_data_4.csv", index=False)
    dataset5.to_csv("datasets/crop_data_5.csv", index=False)

    print("Datasets generated successfully!")
    print(f"Dataset 1: {len(dataset1)} rows")
    print(f"Dataset 2: {len(dataset2)} rows")
    print(f"Dataset 3: {len(dataset3)} rows")
    print(f"Dataset 4: {len(dataset4)} rows")
    print(f"Dataset 5: {len(dataset5)} rows")
