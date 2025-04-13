# services/storage/models.py
from sqlalchemy import Column, Integer, String, DateTime, ARRAY
from db import Base
from datetime import datetime

class Memo(Base):
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(String, nullable=False)
    summary = Column(String)
    tags = Column(ARRAY(String))
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
