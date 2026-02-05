"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface Item {
  id: number; nama: string; kategori: string; stok: number; harga: number;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama: '', kategori: '', stok: 0, harga: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/items');
      setItems(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(items);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Barang");
  XLSX.writeFile(workbook, "Laporan_Inventaris_Danang.xlsx");
};

  const openEditModal = (item: Item) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({ nama: item.nama, kategori: item.kategori, stok: item.stok, harga: item.harga });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedId) {
        await axios.put(`http://127.0.0.1:8000/items/${selectedId}`, formData);
      } else {
        await axios.post('http://127.0.0.1:8000/items', formData);
      }
      closeModal();
      fetchData();
    } catch (err) { alert("Gagal simpan!"); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormData({ nama: '', kategori: '', stok: 0, harga: 0 });
  };

  const deleteItem = async (id: number) => {
    if (confirm("Hapus barang ini?")) {
      await axios.delete(`http://127.0.0.1:8000/items/${id}`);
      fetchData();
    }
  };

  const filteredItems = items.filter(i => 
    i.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

      <div className="max-w-6xl mx-auto px-4 pt-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3">
              {/* LOGO BOX SEDERHANA (PENGGANTI LOGO NEXT.JS) */}
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-black text-xl">D</span>
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent tracking-tighter">
                DanStock<span className="text-indigo-500">.</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium mt-1 text-lg ml-1">
              Inventory Simplified by <span className="text-indigo-600 font-bold">Danang UISI</span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={exportToExcel}
              className="px-6 py-4 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl font-bold hover:bg-emerald-200 transition-all flex items-center gap-2"
            >
              📊 Export Excel
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              + Tambah Produk
            </button>
          </div>
        </header>
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider text-center">Total Produk</span>
            <span className="text-4xl font-black text-slate-800 text-center mt-2">{items.length}</span>
          </div>
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider text-center">Total Stok</span>
            <span className="text-4xl font-black text-indigo-700 text-center mt-2">{items.reduce((a, b) => a + b.stok, 0)}</span>
          </div>
          <div className="md:col-span-2 relative flex items-center">
            <input 
              type="text" 
              placeholder="Cari nama barang atau kategori..." 
              className="w-full p-5 pl-14 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-6 text-2xl">🔍</span>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Detail Produk</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Kategori</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Stok</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Harga Satuan</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 animate-pulse font-bold italic">Menyiapkan data terbaik untukmu...</td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                  <td className="p-6 font-bold text-slate-700 text-lg">{item.nama}</td>
                  <td className="p-6 text-center">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wide">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xl font-black ${item.stok <= 5 ? 'text-red-500' : item.stok <= 15 ? 'text-orange-500' : 'text-emerald-500'}`}>
                        {item.stok}
                      </span>
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.stok <= 5 ? 'bg-red-500' : item.stok <= 15 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(item.stok * 5, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right font-black text-slate-600">
                    Rp {item.harga.toLocaleString()}
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openEditModal(item)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-90" title="Edit Data">✏️</button>
                      <button onClick={() => deleteItem(item.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90" title="Hapus Data">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL GLASSMORPHISM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20 scale-in-center">
            <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">
              {isEditMode ? 'Edit Produk' : 'Produk Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Nama Barang</label>
                <input type="text" value={formData.nama} placeholder="Masukan nama barang..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition" required onChange={(e) => setFormData({...formData, nama: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Kategori</label>
                <input type="text" value={formData.kategori} placeholder="Contoh: Elektronik, Makanan..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition" required onChange={(e) => setFormData({...formData, kategori: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Stok</label>
                  <input type="number" value={formData.stok} placeholder="0" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition" required onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Harga</label>
                  <input type="number" value={formData.harga} placeholder="Rp" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition" required onChange={(e) => setFormData({...formData, harga: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}