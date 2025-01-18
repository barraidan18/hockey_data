import pandas as pd
import requests
from datetime import datetime

def fetch_moneypuck_data():
    url = "https://moneypuck.com/moneypuck/playerData/seasonSummary/2023/regular/skaters.csv"
    try:
        print("Fetching 2023 regular season skater data from MoneyPuck...")
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Save raw data temporarily to verify download
        with open("raw_data.csv", "w", encoding="utf-8") as f:
            f.write(response.text)
            
        df = pd.read_csv(response.text.splitlines())
        print(f"Successfully fetched {len(df)} rows of data")
        return df
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise

def main():
    # Record start time
    start_time = datetime.now()
    print(f"Script started at {start_time}")
    
    # Fetch data
    df = fetch_moneypuck_data()
    
    # Basic info about the data
    print("\nDataset Info:")
    print(f"Columns: {', '.join(df.columns)}")
    print(f"Shape: {df.shape}")
    
    # Record end time
    end_time = datetime.now()
    print(f"\nScript completed at {end_time}")
    print(f"Total runtime: {end_time - start_time}")

if __name__ == "__main__":
    main()
