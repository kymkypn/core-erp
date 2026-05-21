'use client'

import { useState, useEffect } from 'react'
import { getLeads, createLead, updateLeadStatus, createMeetingEntry } from '@/app/actions/crmActions'

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW_LEAD' | 'NEW_MEETING' | 'UPDATE_STATUS'>('NEW_LEAD')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await getLeads()
    if (res.success) setLeads(res.leads || [])
    setLoading(false)
  }

  // --- FORM GÖNDERİM İŞLEMLERİ ---
  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createLead(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Yeni aday (Lead) eklendi.") }
    else alert(res.error)
  }

  const handleAddMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createMeetingEntry(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Görüşme notu eklendi.") }
    else alert(res.error)
  }

  const handleStatusChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await updateLeadStatus(formData.get('leadId') as string, formData.get('status') as any)
    if (res.success) { loadData(); alert("Adayın satış aşaması güncellendi.") }
    else alert(res.error)
  }

  // --- HESAPLAMALAR ---
  const activeLeads = leads.filter(l => l.status !== 'WON' && l.status !== 'LOST')
  const totalExpectedValue = activeLeads.reduce((sum, l) => sum + l.value, 0)
  const wonDealsValue = leads.filter(l => l.status === 'WON').reduce((sum, l) => sum + l.value, 0)

  // Durum renklerini belirleyen yardımcı fonksiyon
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700'
      case 'CONTACTED': return 'bg-purple-100 text-purple-700'
      case 'MEETING': return 'bg-orange-100 text-orange-700'
      case 'PROPOSAL': return 'bg-yellow-100 text-yellow-700'
      case 'WON': return 'bg-emerald-100 text-emerald-700'
      case 'LOST': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW': return 'Yeni Aday'
      case 'CONTACTED': return 'İletişim Kuruldu'
      case 'MEETING': return 'Toplantı Yapıldı'
      case 'PROPOSAL': return 'Teklif Verildi'
      case 'WON': return 'KAZANILDI'
      case 'LOST': return 'KAYBEDİLDİ'
      default: return status
    }
  }

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">CRM Modülü Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: SATIŞ HUNİSİ LİSTESİ */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Aktif Fırsatlar</h3>
            <p className="text-3xl font-black">{activeLeads.length} <span className="text-sm font-medium text-slate-500">Firma</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-blue-500 font-bold text-xs tracking-widest uppercase mb-1">Beklenen Potansiyel Ciro</h3>
            <p className="text-3xl font-black text-slate-800">₺{totalExpectedValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 bg-emerald-50">
            <h3 className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-1">Kazanılan Satışlar</h3>
            <p className="text-3xl font-black text-emerald-700">₺{wonDealsValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Fırsatlar Tablosu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Satış Hunisi ve Bekleyen Görüşmeler</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Müşteri / Aday Firma</th>
                  <th className="p-4">Fırsat (Proje)</th>
                  <th className="p-4">Beklenen Ciro</th>
                  <th className="p-4">Satış Aşaması</th>
                  <th className="p-4">Son Görüşme</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Henüz müşteri adayı eklenmedi.</td></tr>
                ) : (
                  leads.map(lead => {
                    const lastMeeting = lead.meetings[lead.meetings.length - 1]
                    return (
                      <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-black text-slate-800 text-base">{lead.companyName}</p>
                          <p className="text-xs text-slate-500 font-medium">👤 {lead.contactName || 'Belirtilmedi'} | 📞 {lead.phone || '-'}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-700">{lead.title}</td>
                        <td className="p-4 font-black text-blue-600 text-lg">₺{lead.value.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                            {getStatusText(lead.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          {lastMeeting ? (
                            <div>
                              <p className="text-xs font-bold text-slate-700">{new Date(lastMeeting.date).toLocaleDateString('tr-TR')} ({lastMeeting.type})</p>
                              <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{lastMeeting.notes}</p>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Görüşme Yok</span>
                          )}
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

      {/* SAĞ KISIM: İŞLEM PANELİ (TABS) */}
      <div className="w-full xl:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
        
        {/* Tab Butonları */}
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('NEW_LEAD')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_LEAD' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Yeni Aday
          </button>
          <button onClick={() => setActiveTab('NEW_MEETING')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_MEETING' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Görüşme
          </button>
          <button onClick={() => setActiveTab('UPDATE_STATUS')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'UPDATE_STATUS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Aşama Seç
          </button>
        </div>

        <div className="p-6">
          
          {/* SEKME 1: YENİ ADAY (LEAD) EKLE */}
          {activeTab === 'NEW_LEAD' && (
            <form onSubmit={handleAddLead} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🎯 Potansiyel Müşteri Kartı</h3>
              
              <input name="companyName" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500" placeholder="Firma / Kurum Adı" />
              
              <div className="flex gap-2">
                <input name="contactName" className="w-1/2 px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="İlgili Kişi" />
                <input name="phone" className="w-1/2 px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Telefon" />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 mb-1">Satış Fırsatı Adı (Proje)</label>
                <input name="title" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Örn: 2026 Yıllık Lojistik Anlaşması" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Beklenen Ciro Değeri (₺)</label>
                <input name="value" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-xl text-slate-900 outline-none focus:border-blue-500" placeholder="0.00" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-all shadow-md">
                Adayı Sisteme Ekle
              </button>
            </form>
          )}

          {/* SEKME 2: GÖRÜŞME / TOPLANTI NOTU EKLE */}
          {activeTab === 'NEW_MEETING' && (
            <form onSubmit={handleAddMeeting} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🗓️ Görüşme Kaydı</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Firma?</label>
                <select name="leadId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                  {leads.map(l => <option key={l.id} value={l.id}>{l.companyName} ({l.title})</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tarih</label>
                  <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border-2 rounded-lg font-bold text-xs text-slate-900 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Görüşme Tipi</label>
                  <select name="type" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-xs text-slate-900 outline-none">
                    <option value="Yüz Yüze Toplantı">Yüz Yüze</option>
                    <option value="Telefon Görüşmesi">Telefon</option>
                    <option value="E-Posta / Online">Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Görüşme Detayları</label>
                <textarea name="notes" required rows={3} className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none resize-none" placeholder="Ne konuşuldu? Müşterinin talepleri neler?" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Sonraki Adım (Aksiyon)</label>
                <input name="nextAction" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Örn: Haftaya teklif dosyası iletilecek" />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md">
                Görüşmeyi Kaydet
              </button>
            </form>
          )}

          {/* SEKME 3: DURUM (HUNİ) GÜNCELLE */}
          {activeTab === 'UPDATE_STATUS' && (
            <form onSubmit={handleStatusChange} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🔄 Satış Aşamasını Değiştir</h3>
              
              <select name="leadId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                {leads.map(l => <option key={l.id} value={l.id}>{l.companyName} (Mevcut: {getStatusText(l.status)})</option>)}
              </select>

              <select name="status" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none bg-blue-50">
                <option value="NEW">Yeni Aday</option>
                <option value="CONTACTED">İletişim Kuruldu</option>
                <option value="MEETING">Toplantı Yapıldı</option>
                <option value="PROPOSAL">Teklif Verildi</option>
                <option value="WON">🎉 SATIŞA DÖNDÜ (KAZANILDI)</option>
                <option value="LOST">❌ KAYBEDİLDİ (İPTAL)</option>
              </select>

              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-all shadow-md">
                Aşamayı Kaydet
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}