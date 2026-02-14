#!/usr/bin/env python3
"""
Interactive search interface for Family Guy gags database.
Convenience wrapper that imports from src/database/
"""

import sys
from pathlib import Path

# Add src to path so we can import the database module
sys.path.insert(0, str(Path(__file__).parent / "src" / "database"))

from search_gags import interactive_search

if __name__ == '__main__':
    interactive_search()
