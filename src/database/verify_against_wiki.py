#!/usr/bin/env python3
"""
Verification script - compare our database against actual wiki content
to identify missing gags.
"""

import cloudscraper
from bs4 import BeautifulSoup
import time
from pathlib import Path
from src.database.gag_database import GagDatabase

def get_wiki_gag_count(season_num, scraper):
    """Fetch a season page and count actual gags listed."""
    url = f"https://familyguy.fandom.com/wiki/Cutaway_Gags_Season_{season_num}"
    
    try:
        response = scraper.get(url, timeout=15)
        response.raise_for_status()
        time.sleep(0.5)
    except Exception as e:
        print(f"Season {season_num}: ERROR fetching - {e}")
        return None, None, []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    tables = soup.find_all('table', {'class': 'wikitable'})
    
    if not tables:
        return None, None, []
    
    table = tables[0]
    rows = table.find_all('tr')[1:]  # Skip header
    
    # Extract all titles from the table
    titles = []
    for i in range(0, len(rows), 2):
        if i + 1 >= len(rows):
            break
        
        data_row = rows[i]
        cells = data_row.find_all('td')
        
        if len(cells) >= 2:
            title = cells[1].get_text(strip=True)
            if title:
                titles.append(title)
    
    return len(titles), len(rows), titles

def main():
    print("="*80)
    print("GAGS DATABASE VERIFICATION AGAINST WIKI")
    print("="*80)
    
    # Load our database
    db = GagDatabase()
    db.load_all_gags()
    
    print(f"\nOur database: {len(db.gags)} gags loaded\n")
    
    # Get wiki stats
    scraper = cloudscraper.create_scraper()
    
    wiki_totals = {}
    our_totals = {}
    gaps = {}
    all_missing = []
    
    for season_num in range(1, 25):
        wiki_count, table_rows, wiki_titles = get_wiki_gag_count(season_num, scraper)
        
        if wiki_count is None:
            continue
        
        # Count what we have for this season
        our_count = sum(1 for g in db.gags.values() if g.season == season_num)
        our_totals[season_num] = our_count
        wiki_totals[season_num] = wiki_count
        
        gap = wiki_count - our_count
        gaps[season_num] = gap
        
        status = "✅" if gap == 0 else "⚠️ "
        print(f"Season {season_num:2d}: Wiki={wiki_count:3d}  Ours={our_count:3d}  Gap={gap:+3d}  {status}")
        
        # Find specific missing titles
        if gap > 0:
            our_titles = {g.title for g in db.gags.values() if g.season == season_num}
            missing_in_season = [t for t in wiki_titles if t not in our_titles]
            for title in missing_in_season:
                all_missing.append((season_num, title))
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    total_wiki = sum(wiki_totals.values())
    total_ours = sum(our_totals.values())
    total_gap = total_wiki - total_ours
    
    print(f"\nTotal in Wiki:      {total_wiki} gags")
    print(f"Total in Database:  {total_ours} gags")
    print(f"Total Gap:          {total_gap} gags")
    
    if all_missing:
        print(f"\n❌ MISSING GAGS ({len(all_missing)} total):\n")
        for season, title in all_missing:
            print(f"  Season {season:2d}: {title}")
    else:
        print("\n✅ No gaps found! Database is complete.")
    
    # Show seasons with biggest gaps
    sorted_gaps = sorted([(s, gap) for s, gap in gaps.items() if gap > 0], 
                        key=lambda x: x[1], reverse=True)
    
    if sorted_gaps:
        print(f"\n⚠️  SEASONS WITH LARGEST GAPS:")
        for season, gap in sorted_gaps[:5]:
            print(f"  Season {season}: {gap} missing gags")
    
    print("\n" + "="*80)

if __name__ == '__main__':
    main()
