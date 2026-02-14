#!/usr/bin/env python3
"""
Family Guy Cutaway Gags Counter
Counts cutaway gags per season and creates a visualization.
"""

import cloudscraper
from bs4 import BeautifulSoup
import time
import matplotlib.pyplot as plt


def count_gags_in_season(season_url, season_number, scraper):
    """Count cutaway gags in a season."""
    print(f"Scraping Season {season_number}...", end=" ")
    
    try:
        response = scraper.get(season_url, timeout=15)
        response.raise_for_status()
        time.sleep(0.5)  # Be respectful to the server
    except Exception as e:
        print(f"Error: {e}")
        return None
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the main table
    tables = soup.find_all('table', {'class': 'wikitable'})
    
    if not tables:
        print("No wikitable found")
        return None
    
    # Use the first wikitable (usually the main content table)
    table = tables[0]
    rows = table.find_all('tr')[1:]  # Skip header row
    
    # Count actual gags by looking for valid data rows
    gag_count = 0
    for row in rows:
        cells = row.find_all('td')
        
        # Valid gag row has at least title and episode
        if len(cells) >= 3:
            title = cells[1].get_text(strip=True) if len(cells) > 1 else ""
            episode = cells[2].get_text(strip=True) if len(cells) > 2 else ""
            
            if title and episode:
                gag_count += 1
    
    print(f"{gag_count} gags")
    
    return gag_count


def main():
    """Main function to count gags per season."""
    print("Family Guy Cutaway Gags Counter")
    print("=" * 50)
    print()
    
    # Scrape all seasons
    scraper = cloudscraper.create_scraper()
    
    season_data = {}
    total_gags = 0
    
    for season_num in range(1, 25):  # Seasons 1-24
        url = f"https://familyguy.fandom.com/wiki/Cutaway_Gags_Season_{season_num}"
        count = count_gags_in_season(url, season_num, scraper)
        
        if count is not None:
            season_data[season_num] = count
            total_gags += count
    
    print()
    print("=" * 50)
    print("\nSeason Gag Count:")
    print("-" * 50)
    print(f"{'Season':<10}{'Gags':<10}")
    print("-" * 50)
    
    for season, count in sorted(season_data.items()):
        print(f"{season:<10}{count:<10}")
    
    print("-" * 50)
    print(f"{'TOTAL':<10}{total_gags:<10}")
    print()
    
    # Create graph
    seasons = sorted(season_data.keys())
    gags = [season_data[s] for s in seasons]
    
    plt.figure(figsize=(14, 6))
    plt.bar(seasons, gags, color='steelblue', edgecolor='navy', alpha=0.7)
    plt.xlabel('Season', fontsize=12, fontweight='bold')
    plt.ylabel('Number of Gags', fontsize=12, fontweight='bold')
    plt.title('Family Guy Cutaway Gags Per Season', fontsize=14, fontweight='bold')
    plt.xticks(seasons)
    plt.grid(axis='y', alpha=0.3)
    
    # Add value labels on top of bars
    for season, count in zip(seasons, gags):
        plt.text(season, count + 1, str(count), ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('gags_per_season.png', dpi=300, bbox_inches='tight')
    print(f"Graph saved as 'gags_per_season.png'")
    plt.show()


if __name__ == "__main__":
    main()
