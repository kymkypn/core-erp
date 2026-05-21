'use client'

import { useState, useEffect } from 'react'
import { getVehicles, createVehicle, updateVehicleStatus, createVehicleExpense } from '@/app/actions/fleetActions'
import { getAccounts } from '@/app/actions/financeActions'

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'NEW_VEHICLE' | 'STATUS'>('EXPENSE')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [fleetRes, accRes] = await Promise.all([getVehicles(), getAccounts()])
    if (fleetRes.success) setVehicles(fleetRes.vehicles || [])
    setAccounts(accRes || [])
    setLoading(false)
  }

  // --- FORM GÖNDERİM İŞLEMLERİ ---
  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createVehicle(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Yeni araç filoya başarıyla eklendi.") }
    else alert(res.error)
  }

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createVehicleExpense(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Araç masrafı kaydedildi ve kasadan düşüldü.") }
    else alert(res.error)
  }

  const handleStatusChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await updateVehicleStatus(formData.get('vehicleId') as string, formData.get('status') as any)
    if (res.success) { loadData(); alert("Araç operasyon durumu güncellendi.") }
    else alert(res.error)
  }

  // --- HESAPLAMALAR ---
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length
  const totalFleetExpenses = vehicles.reduce((sum, v) => {
    return sum + v.expenses.reduce((s: number, e: any) => s + e.amount, 0)
  }, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700'
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-700'
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Görevde / Aktif'
      case 'MAINTENANCE': return 'Bakımda / Sanayide'
      case 'OUT_OF_SERVICE': return 'Gayriaktif / Yatıyor'
      default: status
    }
  }

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">Filo Modülü Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: FİLO LİSTESİ VE ÖZET KARTLARI */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Toplam Araç</h3>
            <p className="text-3xl font-black">{totalVehicles} <span className="text-sm font-medium text-slate-500">Adet</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-1">Aktif Seferde</h3>
            <p className="text-3xl font-black text-emerald-700">{activeVehicles} <span className="text-sm font-medium text-slate-400">Araç</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-red-500 font-bold text-xs tracking-widest uppercase mb-1">Toplam Filo Maliyeti</h3>
            <p className="text-3xl font-black text-slate-800">₺{totalFleetExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Araçlar Tablosu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Şirket Taşıtları ve Gider Dağılımı</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Araç / Plaka</th>
                  <th className="p-4">Segment / Tür</th>
                  <th className="p-4">Aktif Sürücü</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">Toplam Masrafı</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Filoya henüz araç tanımlanmadı.</td></tr>
                ) : (
                  vehicles.map(vehicle => {
                    const totalCost = vehicle.expenses.reduce((s: number, e: any) => s + e.amount, 0)
                    return (
                      <tr key={vehicle.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-black text-slate-900 text-lg bg-slate-100 px-3 py-1 rounded-md border border-slate-300 w-fit tracking-wider shadow-sm">
                            {vehicle.plate}
                          </p>
                          <p className="text-xs text-slate-500 font-bold mt-1.5">{vehicle.brandModel}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-700 uppercase text-xs">{vehicle.type}</td>
                        <td className="p-4 font-bold text-slate-800">👤 {vehicle.currentDriver || 'Sürücü Atanmadı'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(vehicle.status)}`}>
                            {getStatusText(vehicle.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black text-red-600 text-base">
                          ₺{totalCost.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SAĞ KISIM: AKSİYON PANELİ (TABS) */}
      <div className="w-full xl:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
        
        {/* Tab Butonları */}
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('EXPENSE')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'EXPENSE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Masraf Yaz
          </button>
          <button onClick={() => setActiveTab('NEW_VEHICLE')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_VEHICLE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Yeni Araç
          </button>
          <button onClick={() => setActiveTab('STATUS')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'STATUS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Durum Değiştir
          </button>
        </div>

        <div className="p-6">
          
          {/* SEKME 1: ARACA MASRAF EKLE VE KASADAN DÜŞ */}
          {activeTab === 'EXPENSE' && (
            <form onSubmit={handleAddExpense} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">⛽ Akaryakıt / Sanayi Masrafı</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Araç Seçin (Plaka)</label>
                <select name="vehicleId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 bg-slate-50">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.brandModel}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Gider Türü</label>
                  <select name="type" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500">
                    <option value="Yakıt">Akaryakıt Alımı</option>
                    <option value="Tamir/Bakım">Tamir / Sanayi / Bakım</option>
                    <option value="Kasko/Sigorta">Kasko / Sigorta Poliçesi</option>
                    <option value="Muayene">Araç Muayene Gideri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tutar (₺)</label>
                <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-xl text-slate-900 outline-none focus:border-blue-500 placeholder-slate-400" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Kasadan Ödendi?</label>
                <select name="accountId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-xs text-slate-900 outline-none bg-slate-50 focus:border-blue-500">
                  <option value="">-- Kasa Seçin --</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bakiye: ₺{a.balance})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Açıklama</label>
                <input name="description" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Örn: Shell İstasyon Depo Dolumu" />
              </div>

              <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all shadow-md">
                Gideri İşle ve Kasadan Düş
              </button>
            </form>
          )}

          {/* SEKME 2: FİLOYA YENİ ARAÇ EKLE */}
          {activeTab === 'NEW_VEHICLE' && (
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🚙 Filoya Yeni Demirbaş Ekle</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Araç Plakası</label>
                <input name="plate" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none focus:border-blue-500 uppercase placeholder-slate-400" placeholder="Örn: 34 ABC 123" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Marka / Model / Yıl</label>
                <input name="brandModel" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none placeholder-slate-400" placeholder="Örn: Mercedes Actros 2024" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Araç Segmenti</label>
                  <select name="type" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                    <option value="Tır">Ağır Vasıta / Tır</option>
                    <option value="Kamyonet">Hafif Ticari / Kamyonet</option>
                    <option value="Binek">Şirket Aracı / Binek</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Sorumlu Sürücü (Şoför)</label>
                <input name="currentDriver" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none placeholder-slate-400" placeholder="Örn: Mustafa Kaptan" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-all shadow-md">
                Aracı Filoya Kaydet
              </button>
            </form>
          )}

          {/* SEKME 3: ARAÇ OPERASYON DURUMUNU DEĞİŞTİR */}
          {activeTab === 'STATUS' && (
            <form onSubmit={handleStatusChange} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🔄 Sefer / Bakım Durumu Güncelle</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Taşıt?</label>
                <select name="vehicleId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} ({v.brandModel})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Yeni Operasyonel Durum</label>
                <select name="status" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none bg-blue-50">
                  <option value="ACTIVE">Görevde / Aktif Seferde</option>
                  <option value="MAINTENANCE">🔧 Sanayide / Arızalı / Bakımda</option>
                  <option value="OUT_OF_SERVICE">💤 Gayriaktif / Depoda Yatıyor</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-all shadow-md">
                Durumu Güncelle ve Kilitle
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}