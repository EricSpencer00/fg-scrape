#!/usr/bin/env python3
"""
Quick testing of the gag database.
Convenience wrapper that imports from src/database/
"""

import sys
from pathlib import Path

# Add src to path so we can import the database module
sys.path.insert(0, str(Path(__file__).parent / "src" / "database"))

from test_database import *

if __name__ == '__main__':
    # This will be more directly importable from src/tests/test_database.py
    print("Run src/database/ and src/tests/ for direct access to scripts")
    print("Or use 'python search.py' for interactive search")
