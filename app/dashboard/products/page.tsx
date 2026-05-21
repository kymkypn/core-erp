'use client'

import { useState, useEffect } from 'react'
import { getProducts, createProduct } from '@/app/actions/productActions'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // YENİ: Arama ve Filtreleme state'i
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const res = await getProducts()
    if (res.success) setProducts(res.products || [])
    setLoading(false)
  }

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await createProduct(formData)
    if (res.success) {
      fetchProducts()
      e.currentTarget.reset()
    } else {
      setError(res.error || 'Hata oluştu')
    }
  }

  // YENİ: Arama Kutusuna (veya Barkod Okuyucuya) Göre Filtreleme
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.includes(searchTerm)
  )

  // YENİ: Tabloyu Excel (CSV) Formatında İndirme Fonksiyonu
  const exportToExcel = () => {
    // Türkçe karakterlerin düzgün görünmesi için UTF-8 BOM ekliyoruz (\uFEFF)
    const headers = ["Urun Adi", "Barkod/SKU", "Mevcut Stok"]
    const csvData = filteredProducts.map(p => `${p.name},${p.sku},${p.stock}`)
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + csvData.join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Stok_Raporu_${new Date().toLocaleDateString('tr-TR')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Ürün Listesi ve Akıllı Araçlar */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Üst Kısım: Başlık ve Butonlar */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            📦 Ürün Katalog ve Stok Durumu
          </h2>
          <button 
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            ⬇️ Excel Raporu İndir
          </button>
        </div>

        {/* Orta Kısım: Barkod ve İsim Arama Çubuğu */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <input 
            type="text" 
            placeholder="🔍 Barkod okutun veya ürün adı yazın..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 font-bold focus:border-blue-500 outline-none shadow-sm transition-all"
            autoFocus // Sayfa açılınca imleç direkt burada olur, barkod okuyucuya hazırdır.
          />
        </div>
        
        {/* Alt Kısım: Tablo */}
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="p-4 text-sm font-bold text-slate-500 uppercase">Ürün Adı</th>
                <th className="p-4 text-sm font-bold text-slate-500 uppercase">Barkod / SKU</th>
                <th className="p-4 text-sm font-bold text-slate-500 uppercase text-center">Toplam Stok</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 font-bold">
                    Aranan kriterde ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{product.name}</td>
                    <td className="p-4 text-sm font-medium text-slate-500">{product.sku}</td>
                    <td className="p-4 text-center">
                      <span className={`font-extrabold px-4 py-1.5 rounded-lg ${
                        product.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-900'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Ürün Kaydı (Sağ Panel) */}
      <div className="w-full lg:w-[350px]">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 flex items-center justify-center rounded-lg">+</span>
            Kataloğa Ürün Ekle
          </h3>
          {error && <p className="text-red-600 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ürün Adı</label>
              <input name="name" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-900 font-bold focus:border-blue-500 outline-none" placeholder="Örn: Kavrulmuş Fındık" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Barkod / Stok Kodu</label>
              <input name="sku" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg text-slate-900 font-bold focus:border-blue-500 outline-none" placeholder="Örn: 869000111222" />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition-all mt-2">
              Kataloğa Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}