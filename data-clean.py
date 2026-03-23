# cSpell:disable 

import requests
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime, UTC
import time
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

cities = [
    "kathmandu", "pokhara", "biratnagar", "birgunj", "butwal", "dharan",
    "hetauda", "nepalgunj", "janakpur", "itahari",

    "lalitpur", "bhaktapur", "bharatpur", "dhangadhi", "tulsipur",
    "ghorahi", "lamahi", "itikhar", "bhairahawa", "kapilvastu",
    "lahan", "rajbiraj", "inaruwa", "gaighat", "tri_junction",

    "dhankuta", "ilam", "birtamod", "damak", "kakarbhitta",
    "chainpur", "tumlingtar", "okhaldhunga", "solukhumbu", "ramechhap",

    "dolakha", "charikot", "sindhuli", "banepa", "dhulikhel",
    "kirtipur", "tokha", "budhanilkantha", "chitlang", "kalaiya",

    "malangwa", "gaur", "jaleshwar", "siraha", "diktel",
    "besishahar", "dumre", "baglung", "kusma", "tansen",

    "attariya", "tikapur", "ghodaghodi", "lamki", "dipayal",
    "dadeldhura", "baitadi", "darchula", "jhalari", "krishnapur",

    "surkhet", "birendranagar", "dailekh", "jumla", "kalikot",
    "mugu", "dolpa", "rukum_west", "salyan", "jajarkot"
]
 # fallback coordinates (only used if city not found) 
coords = {
    "itahari": {"lat": 26.663, "lon": 87.271},
    "dharan": {"lat": 26.812, "lon": 87.283},
    "biratnagar": {"lat": 26.452, "lon": 87.271},
    "hetauda": {"lat": 27.428, "lon": 85.032},
    "janakpur": {"lat": 26.728, "lon": 85.925},
    "kathmandu": {"lat": 27.7172, "lon": 85.3240},
    "lalitpur": {"lat": 27.6644, "lon": 85.3188},
    "bhaktapur": {"lat": 27.6710, "lon": 85.4298},
    "pokhara": {"lat": 28.2096, "lon": 83.9856},
    "butwal": {"lat": 27.7000, "lon": 83.4500},
    "bharatpur": {"lat": 27.6766, "lon": 84.4350},
    "birgunj": {"lat": 27.0000, "lon": 84.8667},
    "nepalgunj": {"lat": 28.0500, "lon": 81.6167},
    "dhangadhi": {"lat": 28.6833, "lon": 80.6000},
    "tulsipur": {"lat": 28.1300, "lon": 82.3000},

    "ghorahi": {"lat": 28.0300, "lon": 82.4833},
    "lamahi": {"lat": 28.0500, "lon": 82.4167},
    "itikhar": {"lat": 27.5333, "lon": 83.4500},
    "bhairahawa": {"lat": 27.5050, "lon": 83.4500},
    "kapilvastu": {"lat": 27.5333, "lon": 83.0500},
    "lahan": {"lat": 26.7200, "lon": 86.4800},
    "rajbiraj": {"lat": 26.5333, "lon": 86.7500},
    "inaruwa": {"lat": 26.6000, "lon": 87.1500},
    "gaighat": {"lat": 26.7800, "lon": 86.7200},
    "tri_junction": {"lat": 26.4833, "lon": 87.2833},

    "dhankuta": {"lat": 26.9833, "lon": 87.3333},
    "ilam": {"lat": 26.9167, "lon": 87.9333},
    "birtamod": {"lat": 26.6500, "lon": 87.9900},
    "damak": {"lat": 26.6600, "lon": 87.7000},
    "kakarbhitta": {"lat": 26.6500, "lon": 88.1000},
    "chainpur": {"lat": 27.3000, "lon": 87.3000},
    "tumlingtar": {"lat": 27.3167, "lon": 87.2000},
    "okhaldhunga": {"lat": 27.3167, "lon": 86.5000},
    "solukhumbu": {"lat": 27.5000, "lon": 86.7500},
    "ramechhap": {"lat": 27.3333, "lon": 86.0833},

    "dolakha": {"lat": 27.7000, "lon": 86.0000},
    "charikot": {"lat": 27.6667, "lon": 86.0333},
    "sindhuli": {"lat": 27.2500, "lon": 85.9667},
    "banepa": {"lat": 27.6333, "lon": 85.5167},
    "dhulikhel": {"lat": 27.6167, "lon": 85.5500},
    "kirtipur": {"lat": 27.6667, "lon": 85.2833},
    "tokha": {"lat": 27.7333, "lon": 85.3167},
    "budhanilkantha": {"lat": 27.7667, "lon": 85.3667},
    "chitlang": {"lat": 27.6000, "lon": 85.1500},
    "kalaiya": {"lat": 27.0333, "lon": 85.0000},

    "malangwa": {"lat": 26.8500, "lon": 85.5667},
    "gaur": {"lat": 26.7667, "lon": 85.2833},
    "jaleshwar": {"lat": 26.6500, "lon": 85.8000},
    "siraha": {"lat": 26.6500, "lon": 86.2000},
    "diktel": {"lat": 27.2000, "lon": 86.8000},
    "besishahar": {"lat": 28.2333, "lon": 84.4167},
    "dumre": {"lat": 27.9833, "lon": 84.2667},
    "baglung": {"lat": 28.2667, "lon": 83.5833},
    "kusma": {"lat": 28.2333, "lon": 83.6667},
    "tansen": {"lat": 27.8667, "lon": 83.5500},

    "attariya": {"lat": 28.70, "lon": 80.60},
    "tikapur": {"lat": 28.52, "lon": 81.12},
    "ghodaghodi": {"lat": 28.68, "lon": 80.98},
    "lamki": {"lat": 28.63, "lon": 81.05},
    "dipayal": {"lat": 29.27, "lon": 80.94},
    "dadeldhura": {"lat": 29.30, "lon": 80.58},
    "baitadi": {"lat": 29.53, "lon": 80.55},
    "darchula": {"lat": 29.85, "lon": 80.55},
    "jhalari": {"lat": 28.78, "lon": 80.50},
    "krishnapur": {"lat": 28.70, "lon": 80.60},

    "surkhet": {"lat": 28.60, "lon": 81.63},
    "birendranagar": {"lat": 28.60, "lon": 81.63},
    "dailekh": {"lat": 28.85, "lon": 81.70},
    "jumla": {"lat": 29.27, "lon": 82.18},
    "kalikot": {"lat": 29.10, "lon": 81.70},
    "mugu": {"lat": 29.60, "lon": 82.10},
    "dolpa": {"lat": 29.00, "lon": 82.80},
    "rukum_west": {"lat": 28.63, "lon": 82.50},
    "salyan": {"lat": 28.38, "lon": 82.18},
    "jajarkot": {"lat": 28.70, "lon": 82.20}
}

all_data = []

today = datetime.now(UTC).date()

for city in cities:
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()

        # fallback
        if "list" not in data:
            print(f"City not found: {city}, trying lat/lon...")
            if city in coords:
                lat = coords[city]["lat"]
                lon = coords[city]["lon"]

                url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
                response = requests.get(url)
                data = response.json()
            else:
                continue

        city_data = []

        for item in data["list"]:
            dt = datetime.fromtimestamp(item["dt"])

            city_data.append({
                "city": city,
                "date": dt.date(),
                "temp": item["main"]["temp"],
                "humidity": item["main"]["humidity"],
                "wind_speed": item["wind"]["speed"],
                "rainfall": item.get("rain", {}).get("3h", 0),
                "weather": item["weather"][0]["description"]
            })

        df_city = pd.DataFrame(city_data)

        # -------------------------------
        # Aggregate daily
        # -------------------------------
        df_daily = df_city.groupby(["city", "date"]).agg({
            "temp": "mean",
            "humidity": "mean",
            "wind_speed": "mean",
            "rainfall": "sum",
            "weather": "first",
            "date": "count"
        }).rename(columns={"date": "count"}).reset_index()

        # -------------------------------
        # filtering
        # -------------------------------
        df_daily = df_daily[
            (df_daily["count"] >= 6) | (df_daily["date"] == today)
        ]

        # -------------------------------
        # Keep from today → next 5 days
        # -------------------------------
        df_daily = df_daily[df_daily["date"] >= today]
        df_daily = df_daily.sort_values("date").head(5)

        # -------------------------------
        # Round values
        # -------------------------------
        df_daily = df_daily.round({
            "temp": 2,
            "humidity": 2,
            "wind_speed": 2,
            "rainfall": 2
        })

        # -------------------------------
        # Rainfall index
        # -------------------------------
        def get_index(rain):
            if rain == 0:
                return 1
            elif rain <= 2:
                return 2
            elif rain <= 10:
                return 3
            elif rain <= 30:
                return 4
            else:
                return 5

        df_daily["rainfall_index"] = df_daily["rainfall"].apply(get_index)

        
        df_daily["timestamp"] = datetime.now(UTC)

        all_data.append(df_daily)

        time.sleep(1)

    except Exception as e:
        print(f"Error fetching {city}: {e}")

# -------------------------------
# Combine all cities
# -------------------------------
final_df = pd.concat(all_data, ignore_index=True)

print(final_df)

# -------------------------------
# DB connection
# -------------------------------
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

# Drop table
with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS weekly_weather;"))
    conn.commit()

print("🗑️ Old table dropped")

# Remove helper column
if "count" in final_df.columns:
    final_df = final_df.drop(columns=["count"])

# Insert fresh data
final_df.to_sql(
    "weekly_weather",
    engine,
    if_exists="replace",
    index=False
)

print("✅ New table created & data inserted!")