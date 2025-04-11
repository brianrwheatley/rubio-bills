from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

def load_data():
    historical = pd.read_excel("data/Bills-RUBIO.xlsx")
    present = pd.read_excel("data/Bills-RUBIO-Present.xlsx")

    historical.columns = historical.columns.str.strip()
    present.columns = present.columns.str.strip()
    historical = historical[historical["Session"] != 20252026]

    df = pd.concat([present, historical], ignore_index=True)
    df = df[(df["Version"] == "Chaptered") | (df["Session"] == 20252026)].copy()
    df["Session"] = df["Session"].astype(str).str[:4] + "-" + df["Session"].astype(str).str[4:]
    df.fillna("", inplace=True)
    df.loc[df["Version"] == "Chaptered", "Status"] = df.loc[df["Version"] == "Chaptered", "Status"].replace("", "Passed")
    df.drop(columns=["Version"], inplace=True)
    df.rename(columns={"Measure": "Bill"}, inplace=True)
    df["Bill_link"] = df.apply(lambda row: f"https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id={row['Session'].replace('-', '')}0{row['Bill'].replace('-', '')}", axis=1)
    return df

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    df = load_data()
    return jsonify(df.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(debug=True)
