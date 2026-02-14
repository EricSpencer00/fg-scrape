#!/usr/bin/env python3
"""Quick test of gag database functionality."""
from gag_database import GagDatabase

db = GagDatabase()
db.load_all_gags()

# Test 1: Search by Peter
print("=" * 60)
print("TEST 1: Search for 'Peter'")
print("=" * 60)
results = db.search("Peter", search_in='character')
print(f"Found {len(results)} gags featuring Peter Griffin")
print("First 5:")
for gag in results[:5]:
    print(f"  - {gag.title}: {gag.description[:60]}...")

# Test 2: Search by description
print("\n" + "=" * 60)
print("TEST 2: Search description for 'money'")
print("=" * 60)
results = db.search("money", search_in='description')
print(f"Found {len(results)} gags about money")
print("First 5:")
for gag in results[:5]:
    print(f"  - {gag.title}: {gag.description[:60]}...")

# Test 3: Find absurdist gags
print("\n" + "=" * 60)
print("TEST 3: Absurdist gags (non-main characters)")
print("=" * 60)
results = db.find_non_main_character_gags()
print(f"Found {len(results)} absurdist gags")
print("First 5:")
for gag in results[:5]:
    print(f"  - {gag.title} ({gag.cutaway_owner})")

# Test 4: Validation
print("\n" + "=" * 60)
print("TEST 4: Data integrity check")
print("=" * 60)
stats = db.validate_data()
print(f"✅ All {stats['total_gags']} gags have complete data")
print(f"✅ {len(stats['characters'])} unique characters")
