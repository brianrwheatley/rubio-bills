# Senator Susan Rubio Legislation Tracker

This is a live Flask web app that loads two Excel files and displays all legislation authored or coauthored by Senator Susan Rubio. The table updates automatically as the Excel files change.

## Run locally

```bash
pip install -r requirements.txt
python app.py
```

Visit `http://localhost:5000`

## Deploy to Render

1. Push this folder to GitHub
2. Create a new Web Service on https://render.com
3. Use:
   - Build command: `pip install -r requirements.txt`
   - Start command: `python app.py`

Place your updated Excel files in `data/`.

