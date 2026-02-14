#!/usr/bin/env python3
"""
Data quality analyzer for Family Guy gags database.
Identifies duplicates, missing skits, and data integrity issues.
"""

from pathlib import Path
import re
from collections import defaultdict
from gag_database import GagDatabase

def find_duplicate_writers():
    """Find gag titles that appear in multiple files (duplicate entries)."""
    db = GagDatabase()
    db.load_all_gags()
    
    file_to_title = defaultdict(list)
    gags_dir = Path("gags")
    
    for filepath in gags_dir.glob("*.txt"):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        title_match = re.search(r'Title:\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else filepath.stem
        file_to_title[title].append(filepath.name)
    
    # Find titles with multiple files
    duplicates = {title: files for title, files in file_to_title.items() if len(files) > 1}
    
    return duplicates

def analyze_owners():
    """Analyze cutaway owners and identify patterns."""
    db = GagDatabase()
    db.load_all_gags()
    
    # Count gags by owner
    owner_count = defaultdict(int)
    owner_gags = defaultdict(list)
    
    for gag in db.gags.values():
        if gag.cutaway_owner:
            owner_count[gag.cutaway_owner] += 1
            owner_gags[gag.cutaway_owner].append(gag.title)
    
    # Find single-appearance owners (one-off characters)
    single_appearance = {owner: gags for owner, gags in owner_gags.items() if len(gags) == 1}
    
    return owner_count, single_appearance

def find_missing_episodes():
    """Identify episodes/seasons that might have missing gags."""
    db = GagDatabase()
    db.load_all_gags()
    
    # Group by season and episode
    season_episodes = defaultdict(set)
    season_gag_count = defaultdict(int)
    
    for gag in db.gags.values():
        if gag.season and gag.episode:
            season_episodes[gag.season].add(gag.episode)
            season_gag_count[gag.season] += 1
    
    return season_episodes, season_gag_count

def generate_report():
    """Generate comprehensive data quality report."""
    print("\n" + "="*80)
    print("FAMILY GUY GAGS DATABASE - DATA QUALITY REPORT")
    print("="*80)
    
    # Load database
    db = GagDatabase()
    db.load_all_gags()
    
    print(f"\n✅ OVERALL STATISTICS:")
    print(f"   Total gags loaded: {len(db.gags)}")
    print(f"   Total files in directory: {len(list(Path('gags').glob('*.txt')))}")
    print(f"   Gags with main character: {len([g for g in db.gags.values() if g.cutaway_owner and any(m in g.cutaway_owner.lower() for m in db.main_characters)])}")
    print(f"   Gags with non-main character: {len(db.find_non_main_character_gags())}")
    
    # Check for duplicates
    print(f"\n⚠️  DUPLICATE TITLES (same title in multiple files):")
    duplicates = find_duplicate_writers()
    if duplicates:
        for title, files in sorted(duplicates.items())[:10]:
            print(f"   {title}")
            for fname in files:
                print(f"     - {fname}")
    else:
        print("   ✓ No duplicate titles found")
    
    if len(duplicates) > 10:
        print(f"   ... and {len(duplicates) - 10} more duplicate titles")
    
    # Analyze owners
    print(f"\n📺 CUTAWAY OWNER ANALYSIS:")
    owner_count, single_appearance = analyze_owners()
    
    print(f"   Total unique owners: {len(owner_count)}")
    print(f"   One-time appearances: {len(single_appearance)}")
    
    print(f"\n   Top 15 owners by frequency:")
    for owner, count in sorted(owner_count.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"     {owner:30s} {count:3d} gags")
    
    # Season info
    print(f"\n📅 SEASON/EPISODE STATISTICS:")
    season_episodes, season_gag_count = find_missing_episodes()
    
    if season_gag_count:
        print(f"   Seasons covered: {min(season_gag_count.keys())} - {max(season_gag_count.keys())}")
        print(f"\n   Gags per season:")
        for season in sorted(season_gag_count.keys()):
            count = season_gag_count[season]
            eps = len(season_episodes[season])
            print(f"     Season {season:2d}: {count:3d} gags across {eps:2d} episodes")
    
    # Data completeness
    print(f"\n📊 DATA COMPLETENESS:")
    stats = db.validate_data()
    print(f"   Complete records (all fields): {len(db.gags) - len(stats['missing_multiple_fields'])}")
    print(f"   Records with missing data: {len(stats['missing_multiple_fields'])}")
    
    # Identify potentially missing skits
    print(f"\n🔍 POTENTIAL MISSING SKITS (you should research these):")
    print(f"   Examples of characters with only 1 gag (might have more):")
    single_char_gags = [owner for owner, count in owner_count.items() if count == 1]
    for owner in sorted(single_char_gags)[:20]:
        gag_title = single_appearance[owner][0]
        print(f"     - {owner:30s} in '{gag_title}'")
    
    if len(single_char_gags) > 20:
        print(f"     ... and {len(single_char_gags) - 20} more single-appearance characters")
    
    # Known missing skits
    print(f"\n🚨 KNOWN MISSING SKITS (from your notes):")
    known_missing = ["Sneakers O'toole"]
    for skit in known_missing:
        print(f"   ⚠️  {skit} - NOT FOUND in database")
    
    print("\n" + "="*80 + "\n")

if __name__ == '__main__':
    generate_report()
