from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import traceback
import sys
import os
import threading
import time
import urllib.request

app = Flask(__name__)

# Allow requests from Cloudflare deployment and localhost (dev)
ALLOWED_ORIGINS = [
    "https://alimonyprediction.dipendrsinghchouhan.workers.dev",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# Load calculation engines and scaler on startup
engine1 = None
engine2 = None
sc = None

def load_engines():
    global engine1, engine2, sc
    try:
        engine1 = joblib.load('engines/alimony_amount_engine.pkl')
        engine2 = joblib.load('engines/alimony_duration_engine.pkl')
        sc = joblib.load('engines/alimony_scaler.pkl')
        print("[SUCCESS] Calculation engines loaded successfully.")
    except Exception as e:
        print("[ERROR] Error loading engines:", e)
        traceback.print_exc()

load_engines()

# Exact mapping used during training
mappings = {
    "husband_education": {"12th Pass": 0, "Graduate": 1, "Postgraduate": 2},
    "wife_education": {"12th Pass": 0, "Graduate": 1, "Postgraduate": 2},
    "husband_employment": {"Business": 0, "Employed": 1, "Self-Employed": 2, "Unemployed": 3},
    "wife_employment": {"Employed": 0, "Homemaker": 1, "Self-Employed": 2, "Unemployed": 3},
    "standard_of_living": {"High": 0, "Low": 1, "Middle": 2, "Upper-Middle": 3},
    "wife_health": {"Good": 0, "Moderate": 1, "Poor": 2},
    "husband_health": {"Good": 0, "Moderate": 1, "Poor": 2},
    "wife_career_sacrifice": {"No": 0, "Yes": 1},
    "custody_with": {"Husband": 0, "Shared": 1, "Wife": 2},
    "marriage_type": {"Arranged": 0, "Court Marriage": 1, "Love": 2},
    "divorce_type": {"Contested": 0, "Mutual Consent": 1}
}

expected_fields = [
    "husband_age", "wife_age", "marriage_duration", "number_of_children",
    "husband_income", "wife_income", "husband_assets", "wife_assets",
    "household_expenses", "husband_education", "wife_education",
    "husband_employment", "wife_employment", "standard_of_living",
    "wife_health", "husband_health", "wife_career_sacrifice",
    "custody_with", "marriage_type", "divorce_type"
]

@app.route('/health', methods=['GET'])
def health():
    """GET endpoint /health to check if API is running"""
    return jsonify({
        "status": "API is running",
        "engines_loaded": engine1 is not None
    })

@app.route('/ping', methods=['GET'])
def ping():
    """Lightweight ping endpoint to keep Render free-tier alive"""
    return jsonify({"status": "ok"}), 200

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        if engine1 is None or engine2 is None or sc is None:
            # Try reloading if not loaded
            load_engines()
            if engine1 is None:
                return jsonify({"error": "Calculation engines not loaded on server. Check backend logs."}), 500

        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Check for missing fields
        missing_fields = [field for field in expected_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # Build feature vector matching the exact order
        features = []
        for field in expected_fields:
            val = data[field]
            if field in mappings:
                if val not in mappings[field]:
                    return jsonify({"error": f"Invalid value for {field}: {val}"}), 400
                features.append(mappings[field][val])
            else:
                features.append(float(val))

        # Convert to numpy array and scale
        features_array = np.array([features])
        features_scaled = sc.transform(features_array)

        # Calculate monthly alimony and duration (ensure no negative values)
        monthly_alimony = max(0.0, float(engine1.predict(features_scaled)[0]))
        duration_months = max(0.0, float(engine2.predict(features_scaled)[0]))

        return jsonify({
            "monthly_alimony": monthly_alimony,
            "duration_months": duration_months,
            "status": "success"
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def keep_alive():
    """Ping self every 14 minutes to prevent Render free-tier from sleeping."""
    SELF_URL = os.environ.get(
        "RENDER_EXTERNAL_URL",
        "https://alimony-prediction.onrender.com"
    )
    while True:
        time.sleep(14 * 60)  # 14 minutes
        try:
            urllib.request.urlopen(f"{SELF_URL}/ping", timeout=10)
            print("[KEEP-ALIVE] Ping sent successfully.")
        except Exception as e:
            print(f"[KEEP-ALIVE] Ping failed: {e}")

if __name__ == '__main__':
    # Use PORT environment variable if available (standard for cloud deployment)
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Alimony Calculation Backend on port {port}...")
    # Start keep-alive thread to prevent Render free-tier cold starts
    t = threading.Thread(target=keep_alive, daemon=True)
    t.start()
    app.run(host='0.0.0.0', port=port, debug=False)
