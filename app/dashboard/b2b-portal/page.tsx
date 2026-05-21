'use client'

import { useState, useEffect } from 'react'
import { getCampaigns, createCampaign, getTickets, updateTicketStatus, createB2bTicket } from '@/app/actions/b2bActions'
// Cari hesaplar (Firmalar) modülündeki getCompanies fonksiyonunu kullanıyoruz
import { getCompanies } from '@/app/actions/companyActions' 

export default function B2bPortalPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW_CAMPAIGN' | 'UPDATE_TICKET' | 'DEMO_TICKET'>('NEW_CAMPAIGN')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    // Tüm verileri paralel çekerek hızı artırıyoruz
    const [campRes, tickRes, compRes] = await Promise.all([getCampaigns(), getTickets(), getCompanies()])
    if (campRes.success) setCampaigns(campRes.campaigns || [])
    if (tickRes.success) setTickets(tickRes.tickets || [])
    if (compRes?.success) setCompanies(compRes.companies || [])
    setLoading(false)
  }

  // --- FORM GÖNDERİM İŞLEMLERİ ---
  const handleAddCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createCampaign(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Kampanya tüm bayilere yayınlandı 🚀") }
    else alert(res.error)
  }

  const handleUpdateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await updateTicketStatus(formData.get('ticketId') as string, formData.get('status') as any)
    if (res.success) { loadData(); alert("Destek talebinin durumu güncellendi.") }
    else alert(res.error)
  }

  const handleDemoTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createB2bTicket(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Test amaçlı bayi talebi oluşturuldu.") }
    else alert(res.error)
  }

  // --- HESAPLAMALAR ---
  const activeCampaigns = campaigns.filter(c => new Date(c.endDate) >= new Date() && c.isActive)
  const openTickets = tickets.filter(t => t.status === 'OPEN')
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS')

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-wider animate-pulse">Yeni Talep</span>
      case 'IN_PROGRESS': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-wider">İnceleniyor</span>
      case 'RESOLVED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-wider">Çözüldü</span>
      default: return null
    }
  }

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">B2B Merkez Modülü Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: KAMPANYALAR VE DESTEK TALEPLERİ */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Yayındaki Kampanyalar</h3>
            <p className="text-3xl font-black">{activeCampaigns.length} <span className="text-sm font-medium text-slate-500">Adet</span></p>
          </div>
          <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-200">
            <h3 className="text-red-600 font-bold text-xs tracking-widest uppercase mb-1">Bekleyen (Yeni) Talepler</h3>
            <p className="text-3xl font-black text-red-700">{openTickets.length} <span className="text-sm font-medium text-red-400">Bilet</span></p>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-200">
            <h3 className="text-orange-600 font-bold text-xs tracking-widest uppercase mb-1">İşlemdeki Talepler</h3>
            <p className="text-3xl font-black text-orange-700">{inProgressTickets.length} <span className="text-sm font-medium text-orange-400">Bilet</span></p>
          </div>
        </div>

        {/* 1. TABLO: BAYİ DESTEK TALEPLERİ (TICKETS) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-red-500">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">🚨 Bayi Destek Masası (Helpdesk)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Bayi / Firma</th>
                  <th className="p-4">Talep Konusu & Mesajı</th>
                  <th className="p-4">Durum</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-bold">Harika! Bekleyen hiçbir bayi talebi yok.</td></tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-500 text-xs w-32">
                        {new Date(ticket.updatedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4">
                        <span className="font-black text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                          {ticket.company?.name || 'Bilinmeyen Firma'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{ticket.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.message}</p>
                      </td>
                      <td className="p-4">
                        {getTicketStatusBadge(ticket.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. TABLO: YAYINLANMIŞ KAMPANYALAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-blue-500">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">📢 B2B Portal Kampanyaları</h3>
          </div>
          <div className="p-6 grid grid-cols-1 gap-4">
            {campaigns.length === 0 ? (
              <p className="text-slate-500 font-bold">Sistemde kayıtlı duyuru veya kampanya bulunmuyor.</p>
            ) : (
              campaigns.map(camp => {
                const isExpired = new Date(camp.endDate) < new Date()
                return (
                  <div key={camp.id} className={`p-4 rounded-xl border-2 ${isExpired ? 'border-slate-100 bg-slate-50 opacity-70' : 'border-blue-100 bg-blue-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-800 text-lg">{camp.title}</h4>
                        <p className="text-sm font-medium text-slate-600 mt-1">{camp.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isExpired ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 text-white'}`}>
                          {isExpired ? 'Süresi Doldu' : 'Yayında'}
                        </span>
                        <p className="text-xs font-bold text-slate-500 mt-2">Bitiş: {new Date(camp.endDate).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* SAĞ KISIM: AKSİYON PANELİ (TABS) */}
      <div className="w-full xl:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
        
        {/* Tab Butonları */}
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('NEW_CAMPAIGN')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_CAMPAIGN' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Duyuru Yap
          </button>
          <button onClick={() => setActiveTab('UPDATE_TICKET')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'UPDATE_TICKET' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Bilet Yanıtla
          </button>
          <button onClick={() => setActiveTab('DEMO_TICKET')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'DEMO_TICKET' ? 'border-b-2 border-slate-600 text-slate-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Demo Test
          </button>
        </div>

        <div className="p-6">
          
          {/* SEKME 1: YENİ KAMPANYA YAYINLA */}
          {activeTab === 'NEW_CAMPAIGN' && (
            <form onSubmit={handleAddCampaign} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🚀 Yeni Kampanya Çık</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Kampanya Başlığı</label>
                <input name="title" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500" placeholder="Örn: Hafta Sonu %15 Ek İskonto" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Geçerlilik Bitiş Tarihi</label>
                <input type="date" name="endDate" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Kampanya Detayları</label>
                <textarea name="description" required rows={4} className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 resize-none" placeholder="Bayiler bu bildirimi portala girdiklerinde görecekler..." />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md">
                Tüm Bayilere Yayınla
              </button>
            </form>
          )}

          {/* SEKME 2: BİLET DURUMU GÜNCELLE */}
          {activeTab === 'UPDATE_TICKET' && (
            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🛠️ Destek Bileti Yönetimi</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">İlgili Bilet (Ticket)</label>
                <select name="ticketId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                  <option value="">-- Çözülecek Talebi Seçin --</option>
                  {tickets.map(t => <option key={t.id} value={t.id}>{t.company?.name} - {t.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Aşama Güncelle</label>
                <select name="status" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none">
                  <option value="OPEN">🔴 Yeni Talep Olarak Bırak</option>
                  <option value="IN_PROGRESS">🟠 İnceleniyor / İşlemde</option>
                  <option value="RESOLVED">🟢 Sorun Çözüldü (Kapat)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all shadow-md">
                Durumu Kaydet
              </button>
            </form>
          )}

          {/* SEKME 3: DEMO TEST (BAYİ GİBİ TALEP AÇ) */}
          {activeTab === 'DEMO_TICKET' && (
            <form onSubmit={handleDemoTicket} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">🧪 Bayi Simülasyonu</h3>
              <p className="text-[10px] font-bold text-slate-500 mb-4 leading-relaxed">
                Bu alan test amaçlıdır. Bir bayi B2B portalından talep açtığında merkeze (buraya) nasıl düşeceğini test edebilirsiniz.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Firma Gibi Açalım?</label>
                <select name="companyId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none">
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Konu Başlığı</label>
                <input name="title" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" defaultValue="Sipariş Gecikmesi" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mesajınız</label>
                <textarea name="message" required rows={3} className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none resize-none" defaultValue="Geçen hafta verdiğimiz 50 adetlik sipariş hala yola çıkmadı, bilgi rica ediyoruz." />
              </div>

              <button type="submit" className="w-full bg-slate-200 text-slate-800 font-black py-3 rounded-lg hover:bg-slate-300 transition-all shadow-sm">
                Test Talebini Gönder
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}