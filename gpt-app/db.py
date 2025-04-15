from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class Memo(Base):
    __tablename__ = 'memos'
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    result_json = Column(JSON, nullable=False)
    categories = relationship('MemoCategory', back_populates='memo')

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    memos = relationship('MemoCategory', back_populates='category')

class MemoCategory(Base):
    __tablename__ = 'memo_categories'
    id = Column(Integer, primary_key=True)
    memo_id = Column(Integer, ForeignKey('memos.id'))
    category_id = Column(Integer, ForeignKey('categories.id'))
    sentence_number = Column(Integer, nullable=False)
    sentence = Column(Text, nullable=False)

    memo = relationship('Memo', back_populates='categories')
    category = relationship('Category', back_populates='memos')

engine = create_engine('sqlite:///thinkengine.db')
SessionLocal = sessionmaker(bind=engine)

# Create tables if not exist
def init_db():
    Base.metadata.create_all(engine)
