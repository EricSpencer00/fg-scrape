#!/usr/bin/env python3
"""
Export gag database to various formats (JSON, CSV).
"""

import json
import csv
from gag_database import GagDatabase

def export_json(filename='gags_database.json'):
    """Export database to JSON."""
    db = GagDatabase()
    db.load_all_gags()
    
    data = {
        'metadata': {
            'total_gags': len(db.gags),
            'seasons': (1, 24),
            'unique_characters': len(set(g.cutaway_owner for g in db.gags.values() if g.cutaway_owner))
        },
        'gags': []
    }
    
    for gag in sorted(db.gags.values(), key=lambda g: g.title):
        data['gags'].append({
            'title': gag.title,
            'season': gag.season,
            'episode': gag.episode,
            'episode_order': gag.episode_order,
            'cutaway_owner': gag.cutaway_owner,
            'description': gag.description
        })
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(data['gags'])} gags to {filename}")

def export_csv(filename='gags_database.csv'):
    """Export database to CSV."""
    db = GagDatabase()
    db.load_all_gags()
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'title', 'season', 'episode', 'episode_order', 'cutaway_owner', 'description'
        ])
        writer.writeheader()
        
        for gag in sorted(db.gags.values(), key=lambda g: g.title):
            writer.writerow({
                'title': gag.title,
                'season': gag.season or '',
                'episode': gag.episode or '',
                'episode_order': gag.episode_order or '',
                'cutaway_owner': gag.cutaway_owner or '',
                'description': gag.description or ''
            })
    
    print(f"✅ Exported {len(db.gags)} gags to {filename}")

def export_absurdist_json(filename='absurdist_gags.json'):
    """Export only non-main character gags."""
    db = GagDatabase()
    db.load_all_gags()
    
    absurdist_gags = db.find_non_main_character_gags()
    
    data = {
        'metadata': {
            'absurdist_gags': len(absurdist_gags),
            'description': 'Family Guy gags featuring non-main characters'
        },
        'gags': []
    }
    
    for gag in absurdist_gags:
        data['gags'].append({
            'title': gag.title,
            'season': gag.season,
            'episode': gag.episode,
            'cutaway_owner': gag.cutaway_owner,
            'description': gag.description
        })
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(absurdist_gags)} absurdist gags to {filename}")

if __name__ == '__main__':
    import sys
    
    formats = {
        'json': export_json,
        'csv': export_csv,
        'absurdist': export_absurdist_json,
        'all': lambda: (export_json(), export_csv(), export_absurdist_json())
    }
    
    if len(sys.argv) > 1:
        fmt = sys.argv[1].lower()
        if fmt in formats:
            formats[fmt]()
        else:
            print(f"Unknown format: {fmt}")
            print(f"Available formats: {', '.join(formats.keys())}")
    else:
        print("Export all formats:")
        export_json()
        export_csv()
        export_absurdist_json()
