#!/usr/bin/env python3
"""
Family Guy Gag Database Parser and Searcher
Parses gag files, creates searchable database, and validates data integrity.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, asdict
import argparse


@dataclass
class Gag:
    """Represents a single gag cutaway."""
    title: str
    season: Optional[int] = None
    episode: Optional[str] = None
    episode_order: Optional[int] = None
    cutaway_owner: Optional[str] = None
    description: Optional[str] = None
    filename: str = ""
    
    def to_dict(self):
        return asdict(self)


class GagDatabase:
    """Parser and search engine for Family Guy gags."""
    
    def __init__(self, gags_dir: str = None):
        # Default to gags directory in project root if not specified
        if gags_dir is None:
            gags_dir = Path(__file__).parent.parent.parent / "gags"
        self.gags_dir = Path(gags_dir)
        self.gags: Dict[str, Gag] = {}
        self.index: Dict[str, Set[str]] = {}  # character -> gag titles
        self.main_characters = {
            'peter griffin', 'lois griffin', 'stewie griffin', 
            'chris griffin', 'meg griffin', 'brian griffin',
            'quagmire', 'joe swanson', 'cleveland brown'
        }
        
    def parse_gag_file(self, filepath: Path) -> Optional[Gag]:
        """Parse a single gag file and extract metadata."""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            gag = Gag(title=filepath.stem, filename=filepath.name)
            
            # Parse each field
            title_match = re.search(r'Title:\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
            if title_match:
                gag.title = title_match.group(1).strip()
            
            season_match = re.search(r'Season:\s*(\d+)', content, re.IGNORECASE)
            if season_match:
                gag.season = int(season_match.group(1))
            
            episode_match = re.search(r'Episode:\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
            if episode_match:
                gag.episode = episode_match.group(1).strip()
            
            order_match = re.search(r'Episode Order:\s*(\d+)', content, re.IGNORECASE)
            if order_match:
                gag.episode_order = int(order_match.group(1))
            
            owner_match = re.search(r'Cutaway Owner:\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
            if owner_match:
                gag.cutaway_owner = owner_match.group(1).strip()
            
            desc_match = re.search(r'Description:\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
            if desc_match:
                gag.description = desc_match.group(1).strip()
            
            return gag
            
        except Exception as e:
            print(f"Error parsing {filepath.name}: {e}")
            return None
    
    def load_all_gags(self):
        """Load and parse all gag files."""
        if not self.gags_dir.exists():
            print(f"Gags directory not found: {self.gags_dir}")
            return
        
        gag_files = sorted(self.gags_dir.glob("*.txt"))
        print(f"Loading {len(gag_files)} gag files...")
        
        for filepath in gag_files:
            gag = self.parse_gag_file(filepath)
            if gag:
                self.gags[gag.title] = gag
                self._index_gag(gag)
        
        print(f"Successfully loaded {len(self.gags)} gags")
    
    def _index_gag(self, gag: Gag):
        """Add gag to search indices."""
        # Index cutaway owner
        if gag.cutaway_owner:
            owner_lower = gag.cutaway_owner.lower()
            if owner_lower not in self.index:
                self.index[owner_lower] = set()
            self.index[owner_lower].add(gag.title)
        
        # Index description keywords
        if gag.description:
            words = self._extract_keywords(gag.description)
            for word in words:
                if word not in self.index:
                    self.index[word] = set()
                self.index[word].add(gag.title)
    
    def _extract_keywords(self, text: str, min_length: int = 3) -> List[str]:
        """Extract searchable keywords from text."""
        # Remove common words
        stop_words = {
            'the', 'and', 'for', 'with', 'from', 'his', 'her', 'that',
            'this', 'when', 'where', 'what', 'how', 'who', 'which', 'why',
            'gets', 'tells', 'know', 'find', 'make', 'does', 'says', 'during'
        }
        
        words = re.findall(r'\b[a-z]+\b', text.lower())
        return [w for w in words if len(w) >= min_length and w not in stop_words]
    
    def search(self, query: str, search_in: str = 'all') -> List[Gag]:
        """
        Search gags by character, description, or both.
        
        Args:
            query: Search term
            search_in: 'character', 'description', or 'all'
        
        Returns:
            List of matching gags
        """
        query_lower = query.lower()
        results = set()
        
        for gag in self.gags.values():
            match = False
            
            if search_in in ['character', 'all']:
                if gag.cutaway_owner and query_lower in gag.cutaway_owner.lower():
                    match = True
            
            if search_in in ['description', 'all']:
                if gag.description and query_lower in gag.description.lower():
                    match = True
                # Also check indexed keywords
                if query_lower in self.index:
                    if gag.title in self.index[query_lower]:
                        match = True
            
            if match:
                results.add(gag.title)
        
        return [self.gags[title] for title in sorted(results)]
    
    def find_non_main_character_gags(self) -> List[Gag]:
        """Find gags with characters that aren't main cast."""
        results = []
        for gag in self.gags.values():
            if gag.cutaway_owner:
                owner_lower = gag.cutaway_owner.lower()
                if not any(main in owner_lower for main in self.main_characters):
                    results.append(gag)
        return sorted(results, key=lambda g: g.title)
    
    def validate_data(self) -> Dict[str, any]:
        """Validate data completeness and find issues."""
        stats = {
            'total_gags': len(self.gags),
            'missing_season': [],
            'missing_episode': [],
            'missing_owner': [],
            'missing_description': [],
            'missing_multiple_fields': [],
            'season_range': (float('inf'), float('-inf')),
            'characters': set(),
            'absurdist_gags': []
        }
        
        for gag in self.gags.values():
            fields_missing = []
            if gag.season is None:
                fields_missing.append('season')
                stats['missing_season'].append(gag.title)
            else:
                stats['season_range'] = (
                    min(stats['season_range'][0], gag.season),
                    max(stats['season_range'][1], gag.season)
                )
            
            if gag.episode is None:
                fields_missing.append('episode')
                stats['missing_episode'].append(gag.title)
            
            if gag.cutaway_owner is None:
                fields_missing.append('owner')
                stats['missing_owner'].append(gag.title)
            else:
                stats['characters'].add(gag.cutaway_owner)
            
            if gag.description is None:
                fields_missing.append('description')
                stats['missing_description'].append(gag.title)
            
            if len(fields_missing) > 1:
                stats['missing_multiple_fields'].append({
                    'title': gag.title,
                    'missing': fields_missing
                })
            
            # Find absurdist gags without main characters
            if gag.cutaway_owner:
                owner_lower = gag.cutaway_owner.lower()
                is_main = any(main in owner_lower for main in self.main_characters)
                if not is_main and gag.description:
                    stats['absurdist_gags'].append({
                        'title': gag.title,
                        'owner': gag.cutaway_owner,
                        'description': gag.description
                    })
        
        stats['characters'] = sorted(list(stats['characters']))
        if stats['season_range'][0] == float('inf'):
            stats['season_range'] = None
        else:
            stats['season_range'] = tuple(stats['season_range'])
        
        return stats
    
    def export_json(self, filepath: str):
        """Export all gags to JSON."""
        data = {
            'total': len(self.gags),
            'gags': [gag.to_dict() for gag in sorted(self.gags.values(), key=lambda g: g.title)]
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Exported {len(self.gags)} gags to {filepath}")
    
    def print_gag(self, gag: Gag):
        """Pretty print a gag."""
        print(f"\n{'='*60}")
        print(f"Title: {gag.title}")
        if gag.season:
            print(f"Season: {gag.season}")
        if gag.episode:
            print(f"Episode: {gag.episode}")
        if gag.episode_order:
            print(f"Episode Order: {gag.episode_order}")
        if gag.cutaway_owner:
            print(f"Cutaway Owner: {gag.cutaway_owner}")
        if gag.description:
            print(f"Description: {gag.description}")
        print(f"File: {gag.filename}")
        print('='*60)


def main():
    parser = argparse.ArgumentParser(description='Family Guy Gag Database')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search gags')
    search_parser.add_argument('query', help='Search term')
    search_parser.add_argument('--in', dest='search_in', choices=['character', 'description', 'all'],
                              default='all', help='Search in specific field')
    
    # Validate command
    subparsers.add_parser('validate', help='Validate data completeness')
    
    # Non-main characters command
    subparsers.add_parser('absurdist', help='Find absurdist gags (non-main characters)')
    
    # Export command
    export_parser = subparsers.add_parser('export', help='Export to JSON')
    export_parser.add_argument('--output', default='gags_database.json', help='Output file')
    
    # List command
    subparsers.add_parser('list', help='List all gags')
    
    args = parser.parse_args()
    
    # Load database
    db = GagDatabase()
    db.load_all_gags()
    
    # Execute command
    if args.command == 'search':
        results = db.search(args.query, args.search_in)
        print(f"\nFound {len(results)} gag(s) matching '{args.query}':\n")
        for gag in results:
            db.print_gag(gag)
    
    elif args.command == 'validate':
        stats = db.validate_data()
        print("\n" + "="*60)
        print("GAG DATABASE VALIDATION REPORT")
        print("="*60)
        print(f"\nTotal Gags: {stats['total_gags']}")
        print(f"Season Range: {stats['season_range']}")
        print(f"Unique Characters: {len(stats['characters'])}")
        print(f"Absurdist Gags (non-main cast): {len(stats['absurdist_gags'])}")
        
        print(f"\n⚠️  MISSING DATA:")
        print(f"  Missing Season: {len(stats['missing_season'])}")
        print(f"  Missing Episode: {len(stats['missing_episode'])}")
        print(f"  Missing Owner: {len(stats['missing_owner'])}")
        print(f"  Missing Description: {len(stats['missing_description'])}")
        print(f"  Multiple Missing Fields: {len(stats['missing_multiple_fields'])}")
        
        if stats['missing_multiple_fields']:
            print(f"\n  Gags with multiple missing fields:")
            for item in stats['missing_multiple_fields'][:20]:
                print(f"    - {item['title']}: {', '.join(item['missing'])}")
    
    elif args.command == 'absurdist':
        results = db.find_non_main_character_gags()
        print(f"\n📺 Found {len(results)} absurdist gags (non-main character cutaways):\n")
        # Print ALL absurdist gags (no truncation)
        for gag in results:
            db.print_gag(gag)
    
    elif args.command == 'export':
        db.export_json(args.output)
    
    elif args.command == 'list':
        print(f"\nAll {len(db.gags)} gags:\n")
        for title in sorted(db.gags.keys()):
            gag = db.gags[title]
            owner = gag.cutaway_owner or "Unknown"
            season = f"S{gag.season}" if gag.season else "?"
            print(f"  {title:50s} | {owner:20s} | {season}")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
