from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Membuat file database SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./inventory.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ERD Implementation: Tabel Barang
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    kategori = Column(String)
    stok = Column(Integer)
    harga = Column(Float)

# Membuat tabel di database
Base.metadata.create_all(bind=engine)