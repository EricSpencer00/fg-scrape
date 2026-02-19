#!/usr/bin/env python3
"""
Family Guy Cutaway Gags Scraper
Scrapes cutaway gags from the Family Guy fandom wiki and saves them as individual text files.
"""

import os
import re
import time
import cloudscraper
from bs4 import BeautifulSoup
from pathlib import Path


def sanitize_filename(filename):
    """Remove/replace invalid filename characters."""
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = filename.strip()
    return filename if filename else "unknown"


def scrape_season(season_url, season_number, output_dir="gags", scraper=None):
    """Scrape cutaway gags from a season URL."""
    print(f"Scraping Season {season_number}...")
    
    if scraper is None:
        scraper = cloudscraper.create_scraper()
    
    try:
        response = scraper.get(season_url, timeout=15)
        response.raise_for_status()
        time.sleep(0.5)  # Be respectful to the server
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    gags = []
    
    # Find the main table
    tables = soup.find_all('table', {'class': 'wikitable'})
    
    if not tables:
        print("No wikitable found on the page.")
        return []
    
    # Use the first wikitable (usually the main content table)
    table = tables[0]
    rows = table.find_all('tr')[1:]  # Skip header row
    
    # Process rows: each gag has a data row (6 cells) followed by description row (1 cell)
    # so we iterate through all rows and look for the 6-cell pattern (pure data rows)
    for i in range(len(rows)):
        cells = rows[i].find_all('td')
        
        # Data row always has 6 cells: [screenshot, title, episode, owner, order, season]
        if len(cells) != 6:
            continue
        
        # Extract data (skipping screenshot - index 0)
        try:
            title = cells[1].get_text(strip=True)
            episode = cells[2].get_text(strip=True)
            owner = cells[3].get_text(strip=True)
            episode_order = cells[4].get_text(strip=True)
            
            # Skip if we don't have at least a title and episode
            if not title or not episode:
                continue
            
            # Get description from the next row if it exists
            description = ""
            if i + 1 < len(rows):
                next_row = rows[i + 1]
                desc_cells = next_row.find_all('td')
                # Description row has 1 cell
                if len(desc_cells) == 1:
                    description = desc_cells[0].get_text(strip=True)
            
            gags.append({
                'title': title,
                'episode': episode,
                'owner': owner,
                'episode_order': episode_order,
                'season': season_number,
                'description': description
            })
        
        except (IndexError, AttributeError) as e:
            print(f"Error parsing row: {e}")
            continue
    
    print(f"Found {len(gags)} gags in Season {season_number}")
    return gags


def save_gags_to_files(gags, output_dir="gags"):
    """Save each gag to an individual text file, sorted by name."""
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Sort gags by title
    sorted_gags = sorted(gags, key=lambda x: x['title'].lower())
    
    for gag in sorted_gags:
        filename = sanitize_filename(gag['title']) + ".txt"
        filepath = os.path.join(output_dir, filename)
        
        # Avoid overwriting files by appending season if needed
        base_path = filepath
        counter = 1
        while os.path.exists(filepath) and counter < 100:
            name, ext = os.path.splitext(base_path)
            filepath = f"{name}_s{gag['season']}{ext}"
            counter += 1
        
        content = f"""Title: {gag['title']}
Season: {gag['season']}
Episode: {gag['episode']}
Episode Order: {gag['episode_order']}
Cutaway Owner: {gag['owner']}
Description: {gag['description']}
"""
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Saved: {filename}")


def main():
    """Main function to scrape multiple seasons."""
    print("Family Guy Cutaway Gags Scraper")
    print("=" * 50)
    
    all_gags = []
    
    # Scrape specified seasons
    seasons_to_scrape = input(
        "Enter season numbers to scrape (comma-separated, e.g., '1,2,3') or 'all': "
    ).strip()
    
    if seasons_to_scrape.lower() == 'all':
        # Scrape seasons 1-24 (current seasons available)
        seasons = list(range(1, 25))
    else:
        try:
            seasons = [int(s.strip()) for s in seasons_to_scrape.split(',')]
        except ValueError:
            print("Invalid input. Please enter comma-separated numbers.")
            return
    
    # Create a cloudscraper instance
    scraper = cloudscraper.create_scraper()
    
    for season_num in seasons:
        url = f"https://familyguy.fandom.com/wiki/Cutaway_Gags_Season_{season_num}"
        gags = scrape_season(url, season_num, scraper=scraper)
        all_gags.extend(gags)
    
    if all_gags:
        print(f"\nTotal gags scraped: {len(all_gags)}")
        save_gags_to_files(all_gags)
        print("\nDone! Gags saved to 'gags' directory.")
    else:
        print("No gags were scraped.")


if __name__ == "__main__":
    main()
