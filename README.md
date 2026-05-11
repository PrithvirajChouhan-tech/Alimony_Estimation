# ⚖️ Alimony Estimation Engine

[![GitHub stars](https://img.shields.io/github/stars/PrithvirajChouhan-tech/Alimony_Estimation?style=for-the-badge&color=gold)](https://github.com/PrithvirajChouhan-tech/Alimony_Estimation/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Backend-Flask-green?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)](https://react.dev/)

An advanced, machine-learning-powered estimation engine for monthly alimony and duration. This project features a high-end, glassmorphic UI built with **React & Framer Motion** and a robust **Flask** backend using **Scikit-Learn** models.

---

## ✨ Key Features

- **🚀 Smart Calculation Engine**: Uses pre-trained ML models to estimate alimony amount and duration based on 20+ legal and financial parameters.
- **💎 Premium UI/UX**: Stunning dark-mode interface with glassmorphic cards, smooth transitions, and dynamic confetti effects.
- **🔄 Resilient Connectivity**: Automated 5-second retry logic and connection health checks to ensure the backend is always reachable.
- **🛡️ Intelligent Validation**: Enforces legal requirements (e.g., minimum age of 18) with real-time feedback.
- **📈 Data-Driven**: Built on analyzed datasets with standardized feature scaling for precise estimations.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TanStack Router, Framer Motion, Tailwind CSS, Lucide Icons |
| **Backend** | Flask, Flask-CORS, Joblib, Scikit-Learn, NumPy |
| **Styling** | Modern Vanilla CSS + Glassmorphism |
| **Deployment** | Ready for Cloudflare (Frontend) & Python Anywhere/Heroku (Backend) |

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/PrithvirajChouhan-tech/Alimony_Estimation.git
cd Alimony_Estimation
```

### 2️⃣ Start the Backend
```bash
cd Backend
python -m venv venv
# Activate: venv\Scripts\activate (Windows) or source venv/bin/activate (Unix)
pip install -r requirements.txt
python app.py
```
*The backend server will run on **Port 5001** (optimized to avoid system conflicts).*

### 3️⃣ Start the Frontend
```bash
cd UI/alimony-calculator
bun install  # or npm install
bun dev      # or npm run dev
```
*The UI will be available at **http://localhost:5173**.*

---

## 📁 Project Structure

```bash
Alimony_Estimation/
├── Backend/               # Python Flask API
│   ├── engines/           # ML Models (.pkl)
│   ├── data/              # Datasets
│   └── notebooks/         # Analysis & Training
├── UI/                    # React Frontend
│   └── alimony-calculator/
├── docs/                  # Documentation
└── scripts/               # Utility Scripts
```

---

## 🛡️ Validation Rules
- **Minimum Age**: Both husband and wife must be at least **18 years old**.
- **Calculations**: All inputs are scaled and validated against the training feature vector order to ensure model accuracy.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any feature requests.

## 📄 License
This project is licensed under the MIT License.

---
**Developed by [Prithviraj Singh Chouhan](https://github.com/PrithvirajChouhan-tech)**
