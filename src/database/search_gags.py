#!/usr/bin/env python3
"""
Interactive search interface for Family Guy gags database.
"""

from gag_database import GagDatabase
import sys

def interactive_search():
    """Run interactive search mode."""
    db = GagDatabase()
    db.load_all_gags()
    
    print("\n" + "="*70)
    print("🎬 FAMILY GUY GAG DATABASE - INTERACTIVE SEARCH")
    print("="*70)
    print(f"\nLoaded {len(db.gags)} gags | {len(db.find_non_main_character_gags())} absurdist gags")
    print("\nCommands:")
    print("  'search <term>'   - Search by character or description")
    print("  'char <name>'     - Search by cutaway owner only")
    print("  'desc <term>'     - Search description only")
    print("  'absurdist'       - Show non-main character gags")
    print("  'stats'           - Show database statistics") 
    print("  'list <char>'     - List all gags by a character")
    print("  'quit' or 'exit'  - Quit")
    print("\n" + "-"*70 + "\n")
    
    while True:
        try:
            user_input = input("gag> ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit']:
                print("\n👋 Goodbye!")
                break
            
            parts = user_input.split(maxsplit=1)
            command = parts[0].lower()
            query = parts[1] if len(parts) > 1 else ""
            
            if command == 'search':
                if not query:
                    print("⚠️  Please enter a search term")
                    continue
                results = db.search(query, 'all')
            
            elif command == 'char':
                if not query:
                    print("⚠️  Please enter a character name")
                    continue
                results = db.search(query, 'character')
            
            elif command == 'desc':
                if not query:
                    print("⚠️  Please enter a search term")
                    continue
                results = db.search(query, 'description')
            
            elif command == 'list':
                if not query:
                    print("⚠️  Please enter a character name")
                    continue
                results = db.search(query, 'character')
            
            elif command == 'absurdist':
                results = db.find_non_main_character_gags()
            
            elif command == 'stats':
                stats = db.validate_data()
                print("\n" + "="*70)
                print("DATABASE STATISTICS")
                print("="*70)
                print(f"Total Gags: {stats['total_gags']}")
                print(f"Season Range: {stats['season_range'][0]} - {stats['season_range'][1]}")
                print(f"Unique Characters: {len(stats['characters'])}")
                print(f"Absurdist Gags: {len(stats['absurdist_gags'])}")
                print(f"\nTop 20 Characters by gag count:")
                char_count = {}
                for gag in db.gags.values():
                    if gag.cutaway_owner:
                        char_count[gag.cutaway_owner] = char_count.get(gag.cutaway_owner, 0) + 1
                for char, count in sorted(char_count.items(), key=lambda x: x[1], reverse=True)[:20]:
                    print(f"  {char:30s} {count:3d} gags")
                print("="*70 + "\n")
                continue
            
            else:
                print(f"❌ Unknown command: {command}")
                continue
            
            # Display results
            if not results:
                print(f"❌ No results found for '{user_input}'")
            else:
                print(f"\n📺 Found {len(results)} result(s):\n")
                # show all results when user requested 'absurdist', otherwise show top 10
                display_all = (command == 'absurdist')
                iter_results = results if display_all else results[:10]

                for gag in iter_results:
                    owner = gag.cutaway_owner or "Unknown"
                    season = f"S{gag.season}" if gag.season else "?"
                    print(f"  Title: {gag.title}")
                    print(f"    Owner: {owner}")
                    if gag.description:
                        desc = gag.description[:80] + "..." if len(gag.description) > 80 else gag.description
                        print(f"    Desc:  {desc}")
                    print(f"    Info:  {season} | Ep: {gag.episode or 'N/A'}")
                    print()

                if not display_all and len(results) > 10:
                    print(f"... and {len(results) - 10} more results\n")
                else:
                    print()
        
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    interactive_search()
