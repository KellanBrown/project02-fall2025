"""
models/base.py
===============

This file defines the SQLAlchemy Base class for all database models.
All other models (Todo, Category, etc.) should inherit from Base.
"""

from sqlalchemy.ext.declarative import declarative_base

# Base is created from declarative_base()
# All ORM models will inherit from this Base class
Base = declarative_base()
