from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal, Item

app = FastAPI()

# IZINKAN FRONTEND AKSES BACKEND
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemCreate(BaseModel):
    nama: str
    kategori: str
    stok: int
    harga: float

@app.get("/")
def read_root():
    return {"message": "Backend Inventaris Aktif!"}

@app.get("/items")
def get_items():
    db = SessionLocal()
    items = db.query(Item).all()
    db.close()
    return items

@app.post("/items")
def create_item(item: ItemCreate):
    db = SessionLocal()
    new_item = Item(nama=item.nama, kategori=item.kategori, stok=item.stok, harga=item.harga)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    db.close()
    return new_item

# --- KODE BARU UNTUK EDIT ---
@app.put("/items/{item_id}")
def update_item(item_id: int, updated_data: ItemCreate):
    db = SessionLocal()
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        db.close()
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
    db_item.nama = updated_data.nama
    db_item.kategori = updated_data.kategori
    db_item.stok = updated_data.stok
    db_item.harga = updated_data.harga
    db.commit()
    db.refresh(db_item)
    db.close()
    return db_item

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    db = SessionLocal()
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    db.close()
    return {"message": "Berhasil dihapus"}