#!/usr/bin/env python3
"""
Search for potential missing Family Guy gags.
Helps identify skits that might not have been captured in the database.
"""

import re
from pathlib import Path
from gag_database import GagDatabase

def find_missing_by_keyword(keyword):
    """
    Search for files that mention a keyword but might not be properly indexed.
    Useful for finding skits you remember but can't locate.
    """
    gags_dir = Path("gags")
    results = []
    
    keyword_lower = keyword.lower()
    
    for filepath in gags_dir.glob("*.txt"):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        if keyword_lower in content.lower():
            results.append(filepath.name)
    
    return results

def generate_missing_report():
    """Generate a report of potentially missing skits."""
    db = GagDatabase()
    db.load_all_gags()
    
    print("\n" + "="*80)
    print("MISSING SKITS INVESTIGATION REPORT")
    print("="*80)
    
    # List of known missing skits to track
    potentially_missing = [
        "Sneakers O'toole",
        "Sneakers",
        "Toole",
    ]
    
    print("\n🔎 SEARCHING FOR KNOWN MISSING SKITS:\n")
    
    for skit in potentially_missing:
        print(f"\nSearching for: '{skit}'")
        # Search in database
        db_results = db.search(skit, 'all')
        
        # Search in files
        file_results = find_missing_by_keyword(skit)
        
        print(f"  Database matches: {len(db_results)}")
        for gag in db_results[:5]:
            print(f"    - {gag.title}")
        
        print(f"  File matches: {len(file_results)}")
        for fname in file_results[:5]:
            print(f"    - {fname}")
        
        if not db_results and not file_results:
            print(f"  ⚠️  NOT FOUND - This skit may be missing from your collection")
    
    # Suggest where "Sneakers" might appear based on similar patterns
    print("\n" + "-"*80)
    print("\n💡 SUGGESTIONS FOR FINDING MISSING SKITS:\n")
    print("1. Check Family Guy episode guides for complete gag lists")
    print("2. Search YouTube for 'Family Guy Sneakers O'toole' or similar")
    print("3. Look for episodes that your seasonal coverage is sparse on:")
    
    db.load_all_gags()
    season_eps = {}
    for gag in db.gags.values():
        if gag.season:
            season_eps[gag.season] = season_eps.get(gag.season, 0) + 1
    
    sparse_seasons = [s for s, count in season_eps.items() if count < 30]
    if sparse_seasons:
        print(f"   Sparse seasons: {sorted(sparse_seasons)}")
    
    print("\n4. Common gag owners with limited coverage:")
    owner_count = {}
    for gag in db.gags.values():
        if gag.cutaway_owner:
            owner_count[gag.cutaway_owner] = owner_count.get(gag.cutaway_owner, 0) + 1
    
    limited = [(o, c) for o, c in owner_count.items() if c == 1]
    print(f"   There are {len(limited)} characters with only 1 gag (likely incomplete coverage)")
    
    print("\n" + "="*80 + "\n")

def search_by_keywords(*keywords):
    """
    Interactive search for missing gags using multiple keywords.
    
    Example:
        script_name.py "sneakers" "shoe" "feet"
    """
    db = GagDatabase()
    db.load_all_gags()
    
    all_results = set()
    
    for keyword in keywords:
        db_results = db.search(keyword, 'all')
        for gag in db_results:
            all_results.add(gag.title)
    
    if all_results:
        print(f"\nFound {len(all_results)} gag(s) matching: {', '.join(keywords)}\n")
        for title in sorted(all_results):
            gag = db.gags[title]
            print(f"  {title}")
            if gag.cutaway_owner:
                print(f"    Owner: {gag.cutaway_owner}")
    else:
        print(f"\nNo gags found matching: {', '.join(keywords)}\n")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'search':
        if len(sys.argv) > 2:
            search_by_keywords(*sys.argv[2:])
        else:
            print("Usage: python missing_gags.py search <keyword> [keyword2] ...")
    else:
        generate_missing_report()
