import pandas as pd
import requests
from datetime import datetime
import sys

def fetch_moneypuck_data():
    url = "https://moneypuck.com/moneypuck/playerData/seasonSummary/2023/regular/skaters.csv"
    try:
        print("Fetching 2023 regular season skater data from MoneyPuck...", flush=True)
        sys.stdout.flush()
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        print("Data fetched successfully!", flush=True)
        sys.stdout.flush()
        
        # Save raw data temporarily to verify download
        with open("raw_data.csv", "w", encoding="utf-8") as f:
            f.write(response.text)
            
        df = pd.read_csv(response.text.splitlines())
        print(f"Successfully fetched {len(df)} rows of data", flush=True)
        sys.stdout.flush()
        return df
    except Exception as e:
        print(f"Error fetching data: {str(e)}", file=sys.stderr, flush=True)
        raise

def main():
    # Record start time
    start_time = datetime.now()
    print(f"Script started at {start_time}", flush=True)
    sys.stdout.flush()
    
    try:
        # Fetch data
        df = fetch_moneypuck_data()
        
        # Basic info about the data
        print("\nDataset Info:", flush=True)
        print(f"Columns: {', '.join(df.columns)}", flush=True)
        print(f"Shape: {df.shape}", flush=True)
        sys.stdout.flush()
        
    except Exception as e:
        print(f"Error in main: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)
    
    # Record end time
    end_time = datetime.now()
    print(f"\nScript completed at {end_time}", flush=True)
    print(f"Total runtime: {end_time - start_time}", flush=True)
    sys.stdout.flush()

if __name__ == "__main__":
    main()
