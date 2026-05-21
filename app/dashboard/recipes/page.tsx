'use client'

import { useState, useEffect } from 'react'
import { getRecipes, getProductionOrders, createRecipe, createProductionOrder, completeProductionOrder } from '@/app/actions/productionActions'
import { getProducts } from '@/app/actions/productActions'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW_ORDER' | 'NEW_RECIPE'>('NEW_ORDER')

  // Dinamik hammadde satırları için state
  const [ingredients, setIngredients] = useState([{ productId: '', quantity: 1 }])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [recRes, ordRes, prodRes] = await Promise.all([getRecipes(), getProductionOrders(), getProducts()])
    if (recRes.success) setRecipes(recRes.recipes || [])
    if (ordRes.success) setOrders(ordRes.orders || [])
    if (prodRes.success) setProducts(prodRes.products || [])
    setLoading(false)
  }

  // --- FORM GÖNDERİM İŞLEMLERİ ---
  const handleAddRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Hammadde listesinde boş olanları filtrele ve JSON'a çevir
    const validIngredients = ingredients.filter(ing => ing.productId !== '' && ing.quantity > 0)
    if (validIngredients.length === 0) return alert("Lütfen en az 1 hammadde seçin.")
    
    formData.append('ingredients', JSON.stringify(validIngredients))

    const res = await createRecipe(formData)
    if (res.success) { 
      loadData()
      e.currentTarget.reset()
      setIngredients([{ productId: '', quantity: 1 }])
      alert("Üretim reçetesi başarıyla kaydedildi.") 
    } else alert(res.error)
  }

  const handleAddOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createProductionOrder(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("İş emri üretim bandına iletildi.") }
    else alert(res.error)
  }

  const handleComplete = async (orderId: string) => {
    if (!confirm("Üretimi bitirip hammaddeleri stoktan düşmek istediğinize emin misiniz?")) return
    const res = await completeProductionOrder(orderId)
    if (res.success) { loadData(); alert("Üretim tamamlandı! Hammaddeler düşüldü, ürün stoğa eklendi.") }
    else alert(res.error)
  }

  // --- HESAPLAMALAR VE UI YARDIMCILARI ---
  const totalRecipes = recipes.length
  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">Üretim Bantları Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: İŞ EMİRLERİ VE REÇETE LİSTESİ */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Kayıtlı Reçete (BOM)</h3>
            <p className="text-3xl font-black">{totalRecipes} <span className="text-sm font-medium text-slate-500">Adet</span></p>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-200">
            <h3 className="text-orange-600 font-bold text-xs tracking-widest uppercase mb-1">Bandtaki İş Emirleri</h3>
            <p className="text-3xl font-black text-orange-700">{activeOrders.length} <span className="text-sm font-medium text-orange-400">Emir</span></p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-200">
            <h3 className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-1">Tamamlanan Üretim</h3>
            <p className="text-3xl font-black text-emerald-700">{completedOrders.length} <span className="text-sm font-medium text-emerald-400">Emir</span></p>
          </div>
        </div>

        {/* 1. TABLO: AKTİF İŞ EMİRLERİ (ÜRETİM BANDI) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-orange-500">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">⚙️ Canlı Üretim Bandı (İş Emirleri)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Üretilecek Mamul (Reçete)</th>
                  <th className="p-4">Miktar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Aktif iş emri bulunmuyor.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4">
                        <p className="font-black text-slate-800">{order.recipe?.targetProduct?.name}</p>
                        <p className="text-xs text-slate-500">{order.recipe?.name}</p>
                      </td>
                      <td className="p-4 font-black text-blue-600 text-lg">{order.quantity} <span className="text-xs text-slate-500">Adet</span></td>
                      <td className="p-4">
                        {order.status === 'COMPLETED' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded font-black text-[10px] uppercase tracking-wider">Tamamlandı</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded font-black text-[10px] uppercase tracking-wider animate-pulse">Üretimde</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {order.status !== 'COMPLETED' && (
                          <button onClick={() => handleComplete(order.id)} className="bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors">
                            ✔ Üretimi Bitir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. TABLO: KAYITLI REÇETELER (BOM) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Kayıtlı Reçeteler (Bill of Materials)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.length === 0 ? (
              <p className="text-slate-500 font-bold">Henüz reçete tanımlanmadı.</p>
            ) : (
              recipes.map(recipe => (
                <div key={recipe.id} className="border-2 border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <h4 className="font-black text-slate-800 text-base">{recipe.name}</h4>
                  <p className="text-xs font-bold text-blue-600 mb-3">Nihai Mamul: {recipe.targetProduct?.name}</p>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gerekli Hammaddeler (1 Adet İçin):</p>
                    {recipe.ingredients.map((ing: any) => (
                      <div key={ing.id} className="flex justify-between items-center text-xs font-medium text-slate-600 bg-white px-2 py-1.5 rounded border border-slate-100">
                        <span>• {ing.product?.name}</span>
                        <span className="font-black text-slate-800">{ing.quantity} Br</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* SAĞ KISIM: AKSİYON PANELİ (TABS) */}
      <div className="w-full xl:w-[450px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
        
        {/* Tab Butonları */}
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('NEW_ORDER')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_ORDER' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            İş Emri Ver
          </button>
          <button onClick={() => setActiveTab('NEW_RECIPE')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_RECIPE' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-400 hover:text-slate-700'}`}>
            + Reçete Tanımla
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
          
          {/* SEKME 1: YENİ İŞ EMRİ VER */}
          {activeTab === 'NEW_ORDER' && (
            <form onSubmit={handleAddOrder} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🏭 Üretim Planlama</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Üretilecek Reçete (Mamul)</label>
                <select name="recipeId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 bg-slate-50">
                  <option value="">-- Seçiniz --</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.targetProduct?.name})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Üretim Miktarı (Adet)</label>
                <input name="quantity" type="number" min="1" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-xl text-slate-900 outline-none focus:border-blue-500" placeholder="100" />
                <p className="text-xs font-medium text-slate-400 mt-2">
                  * Sistem, seçilen miktara göre hammaddeleri otomatik hesaplayıp üretim sonunda stoktan düşecektir.
                </p>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md mt-4">
                İş Emrini Başlat
              </button>
            </form>
          )}

          {/* SEKME 2: YENİ REÇETE (BOM) TANIMLA */}
          {activeTab === 'NEW_RECIPE' && (
            <form onSubmit={handleAddRecipe} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">📝 Yeni Reçete Kartı (BOM)</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Reçete Adı</label>
                <input name="name" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-emerald-500" placeholder="Örn: Premium Ahşap Masa (Standart)" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Üretilecek Nihai Mamul</label>
                <select name="targetProductId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-emerald-500 bg-slate-50">
                  <option value="">-- Ürün Kataloğundan Seç --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kullanılacak Hammaddeler</label>
                  <button type="button" onClick={() => setIngredients([...ingredients, { productId: '', quantity: 1 }])} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100">
                    + Satır Ekle
                  </button>
                </div>

                {/* DİNAMİK HAMMADDE SATIRLARI */}
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <select 
                      value={ing.productId}
                      onChange={(e) => {
                        const newIngs = [...ingredients]
                        newIngs[index].productId = e.target.value
                        setIngredients(newIngs)
                      }}
                      className="flex-1 px-2 py-1.5 border border-slate-200 rounded font-bold text-xs text-slate-800 outline-none"
                    >
                      <option value="">-- Hammadde --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    
                    <input 
                      type="number" 
                      min="0.1" 
                      step="any"
                      value={ing.quantity}
                      onChange={(e) => {
                        const newIngs = [...ingredients]
                        newIngs[index].quantity = parseFloat(e.target.value) || 0
                        setIngredients(newIngs)
                      }}
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded font-black text-xs text-center text-slate-800 outline-none"
                    />
                    
                    <button 
                      type="button" 
                      onClick={() => {
                        const newIngs = ingredients.filter((_, i) => i !== index)
                        setIngredients(newIngs.length > 0 ? newIngs : [{ productId: '', quantity: 1 }])
                      }}
                      className="text-red-500 hover:text-red-700 w-6 font-black"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-all shadow-md mt-6">
                Reçeteyi Kaydet
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}