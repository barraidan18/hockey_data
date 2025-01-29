import pandas as pd
import numpy as np
import requests
from datetime import datetime
import json
import os

def get_current_nhl_season():
    """
    Determine current NHL season based on date.
    Returns the start year of the season.
    Example: In October 2023, returns 2023 (2023-24 season)
            In February 2024, returns 2023 (2023-24 season)
    """
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month
    
    # If we're in August through December, it's the start of a new season
    if current_month >= 8:
        return current_year
    # If we're in January through July, it's the previous year's season
    else:
        return current_year - 1

def fetch_skater_data(season_year=2023):
    """
    Fetch skater data from MoneyPuck for a specific season
    
    Args:
        season_year (int): The season year to fetch (defaults to 2023)
    
    Returns:
        pandas.DataFrame: Skater data for the specified season
    """
    import io  # Add this import at the top of the file
    
    url = f"https://moneypuck.com/moneypuck/playerData/seasonSummary/{season_year}/regular/skaters.csv"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        print(f"Fetching {season_year} season data from MoneyPuck...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Use StringIO to create a file-like object from the response content
        df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
        print(f"Successfully fetched {len(df)} records for {season_year} season")
        return df
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {season_year} season: {str(e)}")
        raise

def calculate_per60_metrics(df):
    """Calculate per-60 metrics from raw data"""
    # Define columns for per-60 calculations
    onIceCols = ['OnIce_F_xGoals','OnIce_F_shotAttempts','OnIce_A_xGoals', 'OnIce_A_shotAttempts']
    offIceCols = ['OffIce_F_xGoals','OffIce_F_shotAttempts', 'OffIce_A_xGoals', 'OffIce_A_shotAttempts']
    scoringCols = ['I_F_primaryAssists', 'I_F_secondaryAssists','I_F_goals','I_F_shotAttempts', 'I_F_shotsOnGoal']

    # Calculate OnIce per 60
    for col in onIceCols:
        new_col = f'{col}_per60'
        df[new_col] = df[col] * 60 / (df['icetime']/60)

    # Calculate OffIce per 60
    for col in offIceCols:
        new_col = f'{col}_per60'
        df[new_col] = df[col] * 60 / (df['timeOnBench']/60)

    # Calculate scoring per 60
    for col in scoringCols:
        new_col = f'{col}_per60'
        df[new_col] = df[col] * 60 / (df['icetime']/60)

    return df

def calculate_relative_metrics(df):
    """Calculate relative metrics"""
    # Relative percentages
    df['RelXGoalsPercentage'] = df['onIce_xGoalsPercentage'] - df['offIce_xGoalsPercentage']
    df['RelCFPercentage'] = df['onIce_corsiPercentage'] - df['offIce_corsiPercentage']

    # Relative per-60 metrics
    df['rel_F_xGoals_per60'] = df['OnIce_F_xGoals_per60'] - df['OffIce_F_xGoals_per60']
    df['rel_A_xGoals_per60'] = df['OnIce_A_xGoals_per60'] - df['OffIce_A_xGoals_per60']
    df['rel_F_shotAttempts_per60'] = df['OnIce_F_shotAttempts_per60'] - df['OffIce_F_shotAttempts_per60']
    df['rel_A_shotAttempts_per60'] = df['OnIce_A_shotAttempts_per60'] - df['OffIce_A_shotAttempts_per60']

    return df

def calculate_zscores(df, min_icetime_seconds=6000):
    """Calculate z-scores for metrics grouped by position and situation"""
    # Filter for minimum ice time
    df_filtered = df[df['icetime'] >= min_icetime_seconds].copy()
    
    # Create position groups
    df_filtered['position_group'] = df_filtered['position'].map(
        lambda x: 'F' if x in ['C', 'L', 'R'] else 'D'
    )
    
    # Define metrics for z-score calculation
    player_eval_metrics = [
        'rel_F_xGoals_per60', 'rel_A_xGoals_per60', 
        'rel_F_shotAttempts_per60', 'rel_A_shotAttempts_per60',
        'I_F_primaryAssists_per60', 'I_F_secondaryAssists_per60',
        'I_F_goals_per60', 'I_F_shotAttempts_per60', 'I_F_shotsOnGoal_per60',
        'RelXGoalsPercentage', 'RelCFPercentage'
    ]
    
    # Calculate z-scores
    for column in player_eval_metrics:
        zscore_column = f'{column}_zscore'
        df_filtered[zscore_column] = df_filtered.groupby(['position_group', 'situation'])[column].transform(
            lambda x: (x - x.mean()) / x.std()
        )
    
    # Multiply defensive metrics by -1 to make good defense positive
    defensive_cols = ['rel_A_xGoals_per60_zscore', 'rel_A_shotAttempts_per60_zscore']
    for col in defensive_cols:
        df_filtered[col] = df_filtered[col] * -1
        
    return df_filtered

def rename_columns(df):
    """Rename columns to final format"""
    rename_dict = {
        'rel_F_xGoals_per60_zscore': 'xGF60',
        'rel_A_xGoals_per60_zscore': 'xGA60',
        'rel_F_shotAttempts_per60_zscore': 'CF60',
        'rel_A_shotAttempts_per60_zscore': 'CA60',
        'RelXGoalsPercentage_zscore': 'xGImpact',
        'RelCFPercentage_zscore': 'CFImpact',
        'I_F_primaryAssists_per60_zscore': 'A160',
        'I_F_goals_per60_zscore': 'G60'
    }
    return df.rename(columns=rename_dict)

def main():
    print("Starting data update...")
    os.makedirs('data', exist_ok=True)
    
    current_season = get_current_nhl_season()
    print(f"Updating data for NHL season {current_season}-{str(current_season + 1)[-2:]}")
    
    try:
        df = fetch_skater_data(current_season)
        df = calculate_per60_metrics(df)
        df = calculate_relative_metrics(df)
        df = calculate_zscores(df)
        df = rename_columns(df)
        
        base_columns = ['playerId', 'season', 'name', 'team', 'position', 'situation', 'icetime']
        metric_columns = ['xGF60', 'xGA60', 'CF60', 'CA60', 'xGImpact', 'CFImpact', 'A160', 'G60']
        final_df = df[base_columns + metric_columns].copy()
        
        final_df.to_csv(f'data/hockey_stats_{current_season}.csv', index=False)
        final_df.to_json(f'data/hockey_stats_{current_season}.json', orient='records')
        
        print(f"Processing complete. Saved {len(final_df)} records for {current_season} season.")
        
    except Exception as e:
        print(f"Error processing {current_season} season: {str(e)}")
        raise

if __name__ == "__main__":
    main()
