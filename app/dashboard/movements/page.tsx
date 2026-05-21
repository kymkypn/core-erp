'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/app/actions/productActions'
import { getMovements, createMovement } from '@/app/actions/movementActions'

export default function MovementsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [prodRes, movRes] = await Promise.all([getProducts(), getMovements()])
    if (prodRes.success) setProducts(prodRes.products || [])
    setMovements(movRes || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await createMovement(formData)
    
    if (res.success) {
      loadData()
      e.currentTarget.reset()
      alert("Stok hareketi işlendi ve stok güncellendi.")
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Geçmiş Hareketler Tablosu */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Fire, İade ve Sayım Fişleri</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Tarih</th>
                <th className="p-4">Tür</th>
                <th className="p-4">Ürün</th>
                <th className="p-4 text-center">Miktar</th>
                <th className="p-4">Açıklama / Sebep</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 text-sm">
                  <td className="p-4 font-medium text-slate-500">{new Date(m.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                      m.type === 'WASTE' ? 'bg-red-100 text-red-700' : 
                      m.type === 'RETURN' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {m.type === 'WASTE' ? 'FİRE (ZAYİAT)' : m.type === 'RETURN' ? 'MÜŞTERİ İADESİ' : 'SAYIM DÜZELTME'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{m.product.name}</td>
                  <td className={`p-4 text-center font-black ${m.type === 'WASTE' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {m.type === 'WASTE' ? '-' : '+'}{m.quantity}
                  </td>
                  <td className="p-4 text-slate-600 italic">{m.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Kayıt Formu */}
      <div className="w-full lg:w-[350px]">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold">⚠️</span>
             Yeni Fiş Kes
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">İşlem Türü</label>
              <select name="type" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 bg-slate-50 outline-none">
                <option value="WASTE">Fire Çıkışı (Stoktan Düş)</option>
                <option value="RETURN">İade Alımı (Stoğa Ekle)</option>
                <option value="ADJUSTMENT">Sayım Düzeltmesi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Ürün?</label>
              <select name="productId" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none">
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Miktar (Adet/Kg)</label>
              <input name="quantity" type="number" required min="1" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Açıklama (Zorunlu değil)</label>
              <textarea name="description" rows={3} className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-sm text-slate-900 outline-none" placeholder="Örn: Nakliye sırasında ambalajı patlamış..."></textarea>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-orange-500 transition-all">
              Fişi Onayla
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}