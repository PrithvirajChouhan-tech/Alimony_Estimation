<div align="center">

# ⚖️ Alimony Estimation Engine

**An ML-powered estimation engine for monthly alimony and duration**, featuring a high-end glassmorphic React UI and a robust Flask ML backend.

<br />

### 🌐 [**Try the Live App →**](https://alimonyprediction.dipendrsinghchouhan.workers.dev)

<br />

[![GitHub stars](https://img.shields.io/github/stars/PrithvirajChouhan-tech/Alimony_Estimation?style=for-the-badge&color=gold)](https://github.com/PrithvirajChouhan-tech/Alimony_Estimation/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Flask Backend](https://img.shields.io/badge/Backend-Flask-green?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![React Frontend](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)](https://react.dev/)

</div>

---

## ✨ Key Features

- **🚀 Smart Calculation Engine** — Uses pre-trained ML models to estimate alimony amount and duration based on 20+ legal and financial parameters.
- **💎 Premium UI/UX** — Stunning dark-mode interface with glassmorphic cards, smooth transitions, and dynamic confetti effects.
- **🔄 Resilient Connectivity** — Automated 5-second retry logic and connection health checks to ensure the backend is always reachable.
- **🛡️ Intelligent Validation** — Enforces legal requirements (e.g., minimum age of 18) with real-time feedback.
- **📈 Data-Driven** — Built on analyzed datasets with standardized feature scaling for precise estimations.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TanStack Router, Framer Motion, Tailwind CSS, Lucide Icons |
| **Backend** | Flask, Flask-CORS, Joblib, Scikit-Learn, NumPy |
| **Styling** | Modern Vanilla CSS + Glassmorphism |
| **Deployment** | Cloudflare Workers (Frontend) & Railway (Backend) |

---

## ☁️ Live Deployment

| Service | Link |
|---------|------|
| 🌐 **Frontend App** | [alimonyprediction.dipendrsinghchouhan.workers.dev](https://alimonyprediction.dipendrsinghchouhan.workers.dev) |
| 🔌 **Backend API** | [Flask ML API on Railway](https://ml-based-alimony-estimation-platform-production.up.railway.app) |

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
> The backend server runs on **port 5001** (chosen to avoid common system conflicts).

### 3️⃣ Start the Frontend
```bash
cd UI/alimony-calculator
bun install
bun dev
```

---

## 📁 Project Structure

```bash
Alimony_Estimation/
├── Backend/               # Python Flask API (Railway)
│   ├── engines/           # ML Models (.pkl)
│   ├── data/              # Datasets
│   ├── app.py             # Server Logic
│   └── Procfile           # Railway Instructions
├── UI/                    # React Frontend (Cloudflare)
│   └── alimony-calculator/
├── docs/                  # Project Documentation & Guides
└── scripts/               # Utility Scripts
```

---

## 🛡️ Validation Rules

- **Minimum Age**: Both husband and wife must be at least **18 years old**.
- **Calculations**: All inputs are scaled and validated against the training feature vector order to ensure model accuracy.

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request or open an issue for feature requests and bug reports.

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

<div align="center">

**Developed by [Prithviraj Singh Chouhan](https://github.com/PrithvirajChouhan-tech)**

</div>
