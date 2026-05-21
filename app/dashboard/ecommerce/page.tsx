'use client'

import { useState, useEffect } from 'react'
import { getIntegrations, createIntegration, syncMarketplaceOrders, getExternalOrders } from '@/app/actions/ecommerceActions'

export default function EcommercePage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'NEW_STORE' | 'INFO'>('NEW_STORE')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [intRes, ordRes] = await Promise.all([getIntegrations(), getExternalOrders()])
    if (intRes.success) setIntegrations(intRes.integrations || [])
    if (ordRes.success) setOrders(ordRes.orders || [])
    setLoading(false)
  }

  // --- API SENKRONİZASYON ŞOVU ---
  const handleSync = async (id: string) => {
    setSyncingId(id)
    // Gerçekçi bir API bekleme illüzyonu yaratmak için 1 saniye geciktiriyoruz
    setTimeout(async () => {
      const res = await syncMarketplaceOrders(id)
      if (res.success) {
        await loadData()
        alert("Pazaryeri API bağlantısı kuruldu. Yeni siparişler başarıyla depoya aktarıldı!")
      } else {
        alert(res.error)
      }
      setSyncingId(null)
    }, 1000)
  }

  // --- FORM GÖNDERİMİ ---
  const handleAddStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createIntegration(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Mağaza API anahtarları doğrulandı ve bağlandı.") }
    else alert(res.error)
  }

  // Pazaryeri görsel ve renk yardımcıları
  const getMarketplaceStyle = (type: string) => {
    switch (type) {
      case 'TRENDYOL': return { badge: '🆕 Trendyol', color: 'border-orange-500 text-orange-600 bg-orange-50', btn: 'bg-orange-600 hover:bg-orange-700' }
      case 'AMAZON': return { badge: '📦 Amazon Global', color: 'border-amber-500 text-amber-600 bg-amber-50', btn: 'bg-amber-500 hover:bg-amber-600' }
      case 'HEPSIBURADA': return { badge: '🦊 Hepsiburada', color: 'border-red-500 text-red-600 bg-red-50', btn: 'bg-red-500 hover:bg-red-600' }
      case 'SHOPIFY': return { badge: '🛍️ Shopify Global', color: 'border-emerald-500 text-emerald-600 bg-emerald-50', btn: 'bg-emerald-600 hover:bg-emerald-700' }
      default: return { badge: type, color: 'border-slate-200 text-slate-600 bg-slate-50', btn: 'bg-slate-800 hover:bg-slate-900' }
    }
  }

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">E-Ticaret Hub Yükleniyor...</div>

  return (
    <div className="space-y-6">
      
      {/* ÜST ENTEGRASYON KARTLARI GRUBU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.length === 0 ? (
          <div className="col-span-full bg-blue-50 border-2 border-dashed border-blue-200 p-6 rounded-2xl text-center">
            <p className="text-blue-700 font-bold text-sm">Henüz aktif bir pazaryeri API bağlantısı bulunmuyor. Sağ panelden hemen bir mağaza bağlayın!</p>
          </div>
        ) : (
          integrations.map(store => {
            const style = getMarketplaceStyle(store.name)
            return (
              <div key={store.id} className={`bg-white rounded-2xl p-5 border-2 ${style.color} shadow-sm flex flex-col justify-between h-48 transition-all hover:shadow-md`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase tracking-widest bg-white px-2 py-1 rounded border border-current shadow-sm">{style.badge}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <h4 className="font-black text-slate-800 text-base line-clamp-1">{store.storeName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">API Bağlantısı: Aktif (TLS 1.3)</p>
                  <p className="text-xs font-black text-slate-700 mt-3">Çekilen Sipariş: <span className="text-blue-600 text-sm">{store._count?.externalOrders || 0} Adet</span></p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                    Son Eşitleme: {new Date(store.lastSync).toLocaleTimeString('tr-TR')}
                  </span>
                  <button 
                    onClick={() => handleSync(store.id)}
                    disabled={syncingId !== null}
                    className={`text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm transition-all ${style.btn} ${syncingId === store.id ? 'animate-bounce' : ''}`}
                  >
                    {syncingId === store.id ? 'Bağlanıyor...' : '🔄 Sipariş Çek'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ALT ALAN: SİPARİŞ AKIŞI VE AKSİYON PANELİ */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* SOL: PAZARYERLERİNDEN DÜŞEN CANLI SİPARİŞ AKIŞI */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">🌐 Omnichannel Canlı Sipariş Havuzu</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
              ● API Dinleme Modu Aktif
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Sipariş No</th>
                  <th className="p-4">Pazaryeri Kanalları</th>
                  <th className="p-4">Müşteri / Alıcı</th>
                  <th className="p-4">Fatura Tutarı</th>
                  <th className="p-4">Lojistik Durum</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold">Pazaryerlerinden henüz sipariş akışı gerçekleşmedi. Yukarıdaki "Sipariş Çek" butonunu kullanarak API simülasyonunu başlatabilirsiniz!</td></tr>
                ) : (
                  orders.map(order => {
                    const style = getMarketplaceStyle(order.integration?.name)
                    return (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-black text-slate-800 tracking-wider text-sm">
                          {order.marketplaceOrderId}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${style.color}`}>
                            {order.integration?.name}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {order.customerName}
                        </td>
                        <td className="p-4 font-black text-slate-900 text-base">
                          ₺{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-600 text-white font-black text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm shadow-blue-200">
                            📥 {order.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SAĞ: ENTEGRASYON SİHİRBAZI */}
        <div className="w-full xl:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
          <div className="flex border-b border-slate-200">
            <button onClick={() => setActiveTab('NEW_STORE')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_STORE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
              🔗 Yeni Mağaza Bağla
            </button>
            <button onClick={() => setActiveTab('INFO')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'INFO' ? 'border-b-2 border-slate-600 text-slate-600' : 'text-slate-400 hover:text-slate-700'}`}>
              ℹ Entegrasyon Bilgisi
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'NEW_STORE' && (
              <form onSubmit={handleAddStore} className="space-y-4">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">🔌 Mağaza API Entegrasyonu</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pazaryeri Seçin</label>
                  <select name="name" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none focus:border-blue-500 bg-slate-50">
                    <option value="TRENDYOL">TRENDYOL</option>
                    <option value="AMAZON">AMAZON GLOBAL</option>
                    <option value="HEPSIBURADA">HEPSIBURADA</option>
                    <option value="SHOPIFY">SHOPIFY REST API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Şirket İçi Mağaza Adı</label>
                  <input name="storeName" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500" placeholder="Örn: Ayhan Tekstil Trendyol Mağazası" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">API Key / Token</label>
                  <input name="apiKey" required type="password" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 tracking-widest" placeholder="••••••••••••••••••••••••" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">API Secret / Password (Opsiyonel)</label>
                  <input name="apiSecret" type="password" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 tracking-widest" placeholder="••••••••••••••••••••••••" />
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-all shadow-md mt-2">
                  API Bağlantısını Doğrula
                </button>
              </form>
            )}

            {activeTab === 'INFO' && (
              <div className="space-y-3 text-slate-600 font-medium text-xs leading-relaxed">
                <h4 className="font-black text-slate-800 text-sm mb-2">Omnichannel Altyapı Notları</h4>
                <p>
                  Bu modül, pazaryerlerinin REST API web servisleriyle eşzamanlı çalışacak şekilde tasarlanmıştır.
                </p>
                <p className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-500">
                  GET https://api.trendyol.com/sapigw/suppliers/...
                </p>
                <p>
                  Müşteriye demoya çıktığınızda, sağ taraftan yeni bir Trendyol veya Amazon kartı oluşturup ardından kartın üzerindeki <strong>"Sipariş Çek"</strong> butonuna basarak gelen sipariş simülasyonunu saniyeler içinde tetikleyebilirsiniz!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}