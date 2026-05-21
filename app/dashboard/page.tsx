'use client'

import { useState, useEffect } from 'react'
import { getDashboardStats } from '@/app/actions/dashboardActions'

export default function DashboardHome() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const res = await getDashboardStats()
      if (res.success) setData(res.stats)
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">Kurumsal Analizler Yükleniyor...</div>
  if (!data) return <div className="p-8 font-bold text-red-500">Verilere ulaşılamadı.</div>

  const { role, name, finance, hr, sales, warehouse } = data
  const isSuperUser = role === 'ADMIN' || role === 'COORDINATOR'

  return (
    <div className="space-y-6">
      
      {/* KARŞILAMA VE KİMLİK EKRANI */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Hoş Geldiniz, {name}</h1>
          <p className="text-sm font-bold text-slate-400">
            Yetki Seviyeniz: <span className="text-blue-400 tracking-widest uppercase">{role}</span>
          </p>
          <p className="text-xs text-slate-500 mt-4 max-w-xl leading-relaxed">
            {isSuperUser 
              ? "Sistemdeki tüm departmanların canlı verileri aşağıda özetlenmiştir. İlgili modüllere sol menüden ulaşarak operasyonları yönetebilirsiniz."
              : "Aşağıdaki kontrol paneli sadece departmanınızın hedeflerini ve size atanan günlük operasyonları içermektedir."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WIDGET 1: SATIŞ & CRM (Sadece Sales, Admin, Coordinator görür) */}
        {sales && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">📈 Satış & Pazarlama Hedefleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Kazanılan Satış</p>
                <p className="text-3xl font-black text-blue-700">{sales.wonDeals}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Bekleyen Fırsat</p>
                <p className="text-3xl font-black text-amber-700">{sales.pendingDeals}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl col-span-2 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">B2B Bayi Talepleri</p>
                  <p className="text-2xl font-black text-red-700">{sales.totalTickets} <span className="text-xs text-red-400">Açık Ticket</span></p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 animate-pulse">🚨</div>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET 2: LOJİSTİK, DEPO & ÜRETİM (Sadece Warehouse, Admin, Coordinator görür) */}
        {warehouse && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-orange-500">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">🏭 Depo, Üretim & Lojistik</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Planlanan Üretim</p>
                <p className="text-3xl font-black text-orange-700">{warehouse.plannedProduction}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Tamamlanan İş</p>
                <p className="text-3xl font-black text-emerald-700">{warehouse.completedProduction}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Yoldaki Araçlar</p>
                <p className="text-3xl font-black text-slate-800">🚛 {warehouse.vehiclesOnRoute}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">E-Ticaret Sipariş</p>
                <p className="text-3xl font-black text-purple-700">🛒 {warehouse.ecommerceOrders}</p>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET 3: FİNANS & KASA (Sadece Finance, Admin, Coordinator görür) */}
        {finance && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">💵 Nakit Akışı & Muhasebe</h3>
            <div className="bg-slate-900 p-6 rounded-2xl text-white mb-4 shadow-inner">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Net Kasa Bakiyesi</p>
              <p className="text-4xl font-black">₺{finance.totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Kestiğimiz Faturalar</p>
                <p className="text-xl font-black text-slate-800">{finance.outgoingInvoices} Adet</p>
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gelen Faturalar</p>
                <p className="text-xl font-black text-slate-800">{finance.incomingInvoices} Adet</p>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET 4: İNSAN KAYNAKLARI (Sadece HR, Admin, Coordinator görür) */}
        {hr && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-pink-500">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">👥 Personel & Organizasyon</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-pink-50 border border-pink-100 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Aktif Çalışan Sayısı</p>
                  <p className="text-4xl font-black text-pink-700">{hr.totalEmployees} <span className="text-sm text-pink-400">Personel</span></p>
                </div>
                <div className="text-4xl">👨‍🔧</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dağıtılan Toplam Avans</p>
                  <p className="text-2xl font-black text-slate-800">₺{hr.totalAdvance.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}