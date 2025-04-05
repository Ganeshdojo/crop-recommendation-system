import os
import sys
import django
from pathlib import Path

# Get the path to the Django project root
DJANGO_ROOT = Path(__file__).resolve().parent.parent

# Add the Django project root to Python path
sys.path.append(str(DJANGO_ROOT))

# Set up Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
