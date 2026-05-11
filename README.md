# Alimony Calculator

An advanced Alimony Calculation system consisting of a React frontend and a Flask backend.

## Project Structure
```
alimony-calculator/
├── backend/
│   ├── app.py
│   ├── engine1.pkl
│   ├── engine2.pkl
│   ├── sc.pkl
│   └── requirements.txt
├── frontend/
│   └── (React files)
├── README.md
└── .gitignore
```

## How to Run Backend

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. (Optional) Create a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask application:
   ```bash
   python app.py
   ```
The backend will run on **http://127.0.0.1:5000** in debug mode.

## How to Run Frontend

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
The frontend will run on **http://localhost:5173**.

## How They Connect

The frontend runs on port `5173` and the backend runs on port `5000`. 
When a user submits the alimony form, the React frontend gathers all the inputs and sends a POST request with a JSON payload to `http://127.0.0.1:5000/calculate`. The Flask backend receives the JSON, maps the categorical values to integers using the exact mappings, scales the features using `sc.pkl`, and passes them to the calculation engines. The engines return the calculated monthly alimony and duration, which the backend sends back as a JSON response to the frontend. CORS is enabled on the backend to allow cross-origin requests from the React app.
