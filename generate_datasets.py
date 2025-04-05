import pandas as pd
import numpy as np


def generate_crop_data(n_samples, crop_type):
    # Define parameter ranges with extreme overlap
    ranges = {
        "Rice": {
            "N": (75, 150),  # Massive overlap with Banana and Maize
            "P": (35, 80),  # Overlaps with many crops
            "K": (15, 60),  # Major overlap with ChickPea and Cotton
            "temperature": (18, 32),  # Very wide overlap
            "humidity": (70, 95),
            "pH": (5.0, 7.0),  # Much wider pH range
            "rainfall": (180, 300),
        },
        "Maize": {
            "N": (100, 200),  # Heavy overlap with Rice and Sugarcane
            "P": (45, 100),
            "K": (45, 110),
            "temperature": (16, 30),  # Major overlap with Rice
            "humidity": (40, 70),  # More overlap with multiple crops
            "pH": (5.8, 7.8),
            "rainfall": (130, 240),
        },
        "ChickPea": {
            "N": (20, 70),  # Increased overlap with Jute
            "P": (30, 85),  # Major overlap with multiple crops
            "K": (15, 65),
            "temperature": (12, 26),  # More overlap
            "humidity": (35, 60),  # Overlaps with multiple crops
            "pH": (6.8, 8.8),
            "rainfall": (40, 130),
        },
        "Banana": {
            "N": (80, 160),  # Massive overlap with Rice and Maize
            "P": (20, 60),  # More overlap
            "K": (90, 160),
            "temperature": (20, 34),  # Increased overlap
            "humidity": (65, 90),
            "pH": (5.2, 7.2),  # More overlap
            "rainfall": (160, 280),
        },
        "Cotton": {
            "N": (55, 110),  # More overlap
            "P": (60, 130),
            "K": (30, 85),  # Increased overlap
            "temperature": (25, 39),
            "humidity": (50, 80),  # Much more overlap
            "pH": (6.2, 8.2),
            "rainfall": (80, 180),
        },
        "Coconut": {
            "N": (70, 150),  # More overlap with Rice
            "P": (35, 90),
            "K": (120, 200),
            "temperature": (22, 36),  # More overlap
            "humidity": (75, 100),
            "pH": (5.0, 7.0),  # Same as Rice
            "rainfall": (280, 400),
        },
        "Potato": {
            "N": (90, 180),  # More overlap with Maize
            "P": (75, 140),
            "K": (60, 130),
            "temperature": (6, 20),  # More overlap with Orange
            "humidity": (65, 85),  # More overlap
            "pH": (4.5, 6.5),  # More overlap with Rice
            "rainfall": (60, 150),
        },
        "Sugarcane": {
            "N": (140, 250),
            "P": (45, 110),  # More overlap
            "K": (65, 140),
            "temperature": (27, 41),
            "humidity": (55, 85),  # Much more overlap
            "pH": (6.0, 7.8),
            "rainfall": (140, 260),
        },
        "Jute": {
            "N": (25, 80),  # More overlap
            "P": (25, 70),
            "K": (20, 75),
            "temperature": (30, 44),
            "humidity": (70, 95),  # Same as Rice
            "pH": (5.8, 7.5),
            "rainfall": (230, 320),
        },
        "Orange": {
            "N": (50, 100),  # More overlap
            "P": (40, 90),
            "K": (110, 170),
            "temperature": (8, 24),  # More overlap with ChickPea
            "humidity": (40, 70),  # Same as Maize
            "pH": (7.2, 9.2),
            "rainfall": (45, 130),
        },
        "Mango": {
            "N": (35, 90),  # More overlap
            "P": (110, 200),
            "K": (85, 150),
            "temperature": (23, 37),  # More overlap
            "humidity": (35, 60),  # Same as ChickPea
            "pH": (4.0, 5.8),
            "rainfall": (100, 190),
        },
        "Grapes": {
            "N": (110, 180),
            "P": (20, 60),  # Same as Banana
            "K": (140, 220),
            "temperature": (12, 27),  # More overlap
            "humidity": (45, 75),
            "pH": (7.8, 9.5),
            "rainfall": (250, 350),
        },
        "Watermelon": {
            "N": (160, 280),
            "P": (100, 180),
            "K": (10, 50),  # More overlap with Rice
            "temperature": (33, 45),
            "humidity": (30, 55),  # More overlap
            "pH": (6.5, 8.2),  # Same as Cotton
            "rainfall": (20, 70),
        },
        "Tea": {
            "N": (25, 75),  # More overlap
            "P": (70, 120),
            "K": (160, 250),
            "temperature": (4, 17),  # More overlap with Potato
            "humidity": (85, 100),
            "pH": (3.5, 5.2),
            "rainfall": (380, 500),
        },
        "Coffee": {
            "N": (200, 300),
            "P": (10, 45),  # More overlap
            "K": (40, 100),  # More overlap
            "temperature": (36, 48),
            "humidity": (20, 45),
            "pH": (8.8, 10.0),
            "rainfall": (420, 600),
        },
    }

    # Increased noise and variations
    r = ranges[crop_type]
    base_noise = 0.18  # Increased from 0.12 to 0.18 (18% noise)
    extra_noise = 0.08  # Increased from 0.05 to 0.08 (8% extra noise)

    # Add more variations
    seasonal_factor = np.random.uniform(
        0.80, 1.20, n_samples
    )  # ±20% seasonal variation
    daily_factor = np.random.uniform(0.95, 1.05, n_samples)  # ±5% daily variation
    soil_variation = np.random.uniform(
        0.90, 1.10, n_samples
    )  # ±10% soil condition variation

    data = {
        "N": np.random.uniform(r["N"][0], r["N"][1], n_samples)
        * (1 + np.random.uniform(-base_noise, base_noise, n_samples))
        * seasonal_factor
        * soil_variation,
        "P": np.random.uniform(r["P"][0], r["P"][1], n_samples)
        * (1 + np.random.uniform(-base_noise, base_noise, n_samples))
        * seasonal_factor
        * soil_variation,
        "K": np.random.uniform(r["K"][0], r["K"][1], n_samples)
        * (1 + np.random.uniform(-base_noise, base_noise, n_samples))
        * seasonal_factor
        * soil_variation,
        "temperature": np.random.uniform(
            r["temperature"][0], r["temperature"][1], n_samples
        )
        * (
            1
            + np.random.uniform(
                -base_noise - extra_noise, base_noise + extra_noise, n_samples
            )
        )
        * daily_factor,
        "humidity": np.random.uniform(r["humidity"][0], r["humidity"][1], n_samples)
        * (
            1
            + np.random.uniform(
                -base_noise - extra_noise, base_noise + extra_noise, n_samples
            )
        )
        * daily_factor,
        "pH": np.random.uniform(r["pH"][0], r["pH"][1], n_samples)
        * (1 + np.random.uniform(-base_noise / 2, base_noise / 2, n_samples))
        * soil_variation,
        "rainfall": np.random.uniform(r["rainfall"][0], r["rainfall"][1], n_samples)
        * (
            1
            + np.random.uniform(
                -base_noise - extra_noise, base_noise + extra_noise, n_samples
            )
        )
        * seasonal_factor,
        "crop": [crop_type] * n_samples,
    }

    # Clip values to realistic ranges
    data["pH"] = np.clip(data["pH"], 3.0, 10.0)
    data["humidity"] = np.clip(data["humidity"], 0, 100)
    data["temperature"] = np.clip(data["temperature"], 0, 50)
    data["N"] = np.clip(data["N"], 0, 300)
    data["P"] = np.clip(data["P"], 0, 200)
    data["K"] = np.clip(data["K"], 0, 250)
    data["rainfall"] = np.clip(data["rainfall"], 0, 600)

    return pd.DataFrame(data)


# Selected crops with highly distinct characteristics
crops = [
    "Rice",  # High humidity, high rainfall, acidic soil
    "Maize",  # Very high NPK, low humidity
    "ChickPea",  # Low nitrogen, very low humidity, alkaline soil
    "Banana",  # High potassium, high humidity
    "Cotton",  # High temperature, high phosphorus
    "Coconut",  # Extremely high potassium and rainfall
    "Potato",  # Very low temperature, very acidic soil
    "Sugarcane",  # Extremely high nitrogen and temperature
    "Jute",  # High temperature and humidity, low NPK
    "Orange",  # Low temperature, very alkaline soil
    "Mango",  # Extremely high phosphorus, very low humidity
    "Grapes",  # High nitrogen, extremely high potassium
    "Watermelon",  # Extreme temperature, extremely low humidity
    "Tea",  # Extremely low temperature, extremely acidic
    "Coffee",  # Extreme everything (N, temp, pH, rainfall)
]

# Calculate samples per crop for each dataset
samples_per_crop_1 = 110  # 1643 total rows (110 * 15 = 1650)
samples_per_crop_2 = 161  # 2421 total rows (161 * 15 = 2415)
samples_per_crop_3 = 293  # 4393 total rows (293 * 15 = 4395)

# Generate datasets
for samples_per_crop, filename in [
    # (samples_per_crop_1, "datasets/Crop_recommendation_dataset_large_1.csv"),
    (samples_per_crop_2, "datasets/Crop_recommendation_dataset_large_2.csv"),
    (samples_per_crop_3, "datasets/Crop_recommendation_dataset_large_3.csv"),
]:
    df = pd.concat([generate_crop_data(samples_per_crop, crop) for crop in crops])
    df = df.sample(frac=1).reset_index(drop=True)  # Shuffle the data
    df.to_csv(filename, index=False)
    print(f"Generated {filename} with {len(df)} rows")
