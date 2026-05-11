# Setup & Deployment Guide

## Environment Setup

### Backend Setup

1. **Navigate to Backend:**
   ```bash
   cd Backend
   ```

2. **Create Virtual Environment (recommended):**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application:**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to Frontend:**
   ```bash
   cd UI/alimony-calculator
   ```

2. **Install Dependencies:**
   ```bash
   bun install
   # or npm install (if bun not available)
   ```

3. **Start Development Server:**
   ```bash
   bun dev
   # or npm run dev
   ```

4. **Build for Production:**
   ```bash
   bun build
   # or npm run build
   ```

## Development Workflow

### Adding New Engines
- Place calculation engine `.pkl` files in `Backend/engines/`
- Update `Backend/app.py` to load from the `engines/` directory
- Example: `joblib.load('./engines/alimony_amount_engine.pkl')`

### Adding New Datasets
- Place CSV/data files in `Backend/data/`
- Update notebook/scripts to reference `../data/filename.csv`

### Adding Notebooks
- Place new analysis notebooks in `Backend/notebooks/`
- Use relative paths for data: `../data/`

## Deployment Checklist

- [ ] All dependencies in `requirements.txt` (Backend)
- [ ] All dependencies in `package.json` (Frontend)
- [ ] Calculation engines tested and working
- [ ] Environment variables configured (if needed)
- [ ] Frontend build passes without errors: `bun build`
- [ ] Backend runs without errors: `python app.py`
- [ ] Test with sample data
- [ ] Create `.env` file for sensitive configs (not in repo)

## Troubleshooting

### Node Modules Issue
If frontend has missing packages after cleanup:
```bash
cd UI/alimony-calculator
rm bun.lock  # or package-lock.json
bun install  # reinstall fresh
```

### Python Import Errors
Ensure you're in the correct directory and virtual environment is activated:
```bash
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### Data Not Found
If notebooks report missing data, verify paths:
- Notebooks should reference: `../data/alimony_dataset.csv`
- Check file exists: `Backend/data/alimony_dataset.csv`

## File Locations Reference

| Item | Location |
|------|----------|
| Main Dataset | `Backend/data/alimony_dataset.csv` |
| Calculation Engines | `Backend/engines/*.pkl` |
| Notebooks | `Backend/notebooks/` |
| Frontend App | `UI/alimony-calculator/src/` |
| Configuration | `.env` (create if needed) |
| Documentation | `docs/` (add guides here) |

---
Last Updated: May 10, 2026
