from flask import Flask, render_template, jsonify
import pandas as pd

app = Flask(__name__)

def load_data():
    historical = pd.read_excel("data/Bills-RUBIO.xlsx")
    present = pd.read_excel("data/Bills-RUBIO-Present.xlsx")

    historical.columns = historical.columns.str.strip()
    present.columns = present.columns.str.strip()

    # Remove 2025-2026 from historical
    historical = historical[historical["Session"] != 20252026]

    # Combine
    df = pd.concat([present, historical], ignore_index=True)

    # Only include sessions 2019 and later
    df["Session"] = df["Session"].astype(str)
    df = df[df["Session"].str[:4].astype(int) >= 2019]

    # Keep Chaptered or Enrolled from older sessions, OR everything from 2025-2026
    df = df[(df["Version"].isin(["Chaptered", "Enrolled"])) | (df["Session"] == "20252026")].copy()

    # Format session
    df["Session"] = df["Session"].str[:4] + "-" + df["Session"].str[4:]
    df.fillna("", inplace=True)

    # Label passed and vetoed
    df.loc[df["Version"] == "Chaptered", "Status"] = df.loc[df["Version"] == "Chaptered", "Status"].replace("", "Passed")
    df["Status"] = df["Status"].replace("Senate - Unfinished Business", "Vetoed")

    # Drop Version and rename Measure
    df.drop(columns=["Version"], inplace=True)
    df.rename(columns={"Measure": "Bill"}, inplace=True)

    # Add link
    df["Bill_link"] = df.apply(lambda row: f"https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id={row['Session'].replace('-', '')}0{row['Bill'].replace('-', '')}", axis=1)

    print(f"Loaded {len(df)} bills")
    return df

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    df = load_data()
    return jsonify(df.to_dict(orient="records"))

# Use this for deployment to Render
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

# Use this for local development
#if __name__ == "__main__":
#    app.run(debug=True)
