# services/query/models.py
from sqlalchemy import Column, Integer, String, DateTime, ARRAY
from db import Base

class Memo(Base):
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True)
    original_text = Column(String)
    summary = Column(String)
    tags = Column(ARRAY(String))
    category = Column(String)
    created_at = Column(DateTime)
