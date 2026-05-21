'use client'

import { useState, useEffect } from 'react'
import { getInvoices, createInvoice } from '@/app/actions/invoiceActions'
import { getCompanies } from '@/app/actions/companyActions'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW_INVOICE' | 'GIB_INFO'>('NEW_INVOICE')
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'INCOMING' | 'OUTGOING'>('ALL')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [invRes, compRes] = await Promise.all([getInvoices(), getCompanies()])
    if (invRes.success) setInvoices(invRes.invoices || [])
    if (compRes?.success) setCompanies(compRes.companies || [])
    setLoading(false)
  }

  // --- FORM GÖNDERÝMÝ ---
  const handleAddInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createInvoice(new FormData(e.currentTarget))
    if (res.success) { 
      loadData()
      e.currentTarget.reset()
      alert("Fatura resmi olarak mühürlendi ve GÝB kuyruðuna iletildi! ??") 
    } else {
      alert(res.error)
    }
  }

  // --- FÝLTRELEME VE HESAPLAMALAR ---
  const filteredInvoices = invoices.filter(inv => {
    if (filterDirection === 'ALL') return true
    return inv.direction === filterDirection
  })

  const totalOutgoing = invoices.filter(i => i.direction === 'OUTGOING').reduce((sum, i) => sum + i.grandTotal, 0)
  const totalIncoming = invoices.filter(i => i.direction === 'INCOMING').reduce((sum, i) => sum + i.grandTotal, 0)
  const totalTax = invoices.reduce((sum, i) => sum + i.taxAmount, 0)

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">e-Dönüþüm Hub Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: RESMÝ FATURA KLASÖRLERÝ VE TABLO */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Mali Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Kesiþen Giden Faturalar</h3>
            <p className="text-2xl font-black text-emerald-400">?{totalOutgoing.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold text-xs tracking-widest uppercase mb-1">Alýnan Gelen Faturalar</h3>
            <p className="text-2xl font-black text-red-600">?{totalIncoming.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200">
            <h3 className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-1">Toplam KDV Beyanname Hacmi</h3>
            <p className="text-2xl font-black text-blue-700">?{totalTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Klasör Filtre Butonlarý */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200">
          <button onClick={() => setFilterDirection('ALL')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filterDirection === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            ?? Tüm Faturalar ({invoices.length})
          </button>
          <button onClick={() => setFilterDirection('OUTGOING')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filterDirection === 'OUTGOING' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            ?? Giden Kutusu
          </button>
          <button onClick={() => setFilterDirection('INCOMING')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filterDirection === 'INCOMING' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            ?? Gelen Kutusu
          </button>
        </div>

        {/* Faturalar Tablosu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Resmi e-Fatura Evrak Akýþý</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Fatura No / UUID</th>
                  <th className="p-4">Yön</th>
                  <th className="p-4">Cari Ünvan</th>
                  <th className="p-4">Matrah / KDV</th>
                  <th className="p-4 text-right">Genel Toplam</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold">Bu klasörde henüz resmi fatura evraký bulunmuyor.</td></tr>
                ) : (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-black text-slate-800 tracking-wider font-mono text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 select-all">{invoice.uuid}</p>
                      </td>
                      <td className="p-4">
                        {invoice.direction === 'OUTGOING' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Giden (Satýþ)</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Gelen (Alým)</span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-700 line-clamp-1">{invoice.company?.name || 'Bilinmeyen Cari Account'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{invoice.scenario}</p>
                      </td>
                      <td className="p-4 text-xs text-slate-600 font-medium">
                        <p>Matrah: ?{invoice.totalAmount.toLocaleString('tr-TR')}</p>
                        <p className="text-blue-600">KDV: ?{invoice.taxAmount.toLocaleString('tr-TR')}</p>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900 text-base">
                        ?{invoice.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SAÐ KISIM: FATURA KESME SÝHÝRBAZI */}
      <div className="w-full xl:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('NEW_INVOICE')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_INVOICE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            ? Fatura Düzenle
          </button>
          <button onClick={() => setActiveTab('GIB_INFO')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'GIB_INFO' ? 'border-b-2 border-slate-600 text-slate-600' : 'text-slate-400 hover:text-slate-700'}`}>
            ?? Entegratör Notu
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'NEW_INVOICE' && (
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">?? e-Fatura Portalý</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Evrak Tipi (Yön)</label>
                <select name="direction" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none bg-slate-50">
                  <option value="OUTGOING">?? GÝDEN FATURA (Satýþ / Bayiye)</option>
                  <option value="INCOMING">?? GELEN FATURA (Alým / Tedarikçiden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fatura Senaryosu</label>
                <select name="scenario" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                  <option value="COMMERCIAL">TÝCARÝ FATURA (Onay/Red Mekanizmalý)</option>
                  <option value="BASIC">TEMEL FATURA</option>
                  <option value="EARSIV">E-ARÞÝV FATURA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ýlgili Cari Firma</label>
                <select name="companyId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500">
                  <option value="">-- Firma Seçin --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* DÝNAMÝK KDV SEÇÝMLÝ MATRAH ALANI */}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Matrah (?)</label>
                  <input name="totalAmount" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-base text-slate-900 outline-none focus:border-blue-500" placeholder="0.00" />
                </div>
                
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">KDV Oraný</label>
                  <select name="taxRate" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none bg-slate-50 focus:border-blue-500">
                    <option value="20">%20 (Standart Oran)</option>
                    <option value="10">%10 (Gýda / Tekstil / Ýlaç)</option>
                    <option value="1">%1 (Temel Tüketim / Unlu)</option>
                    <option value="0">%0 (Muafiyetli)</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1">* Seçilen KDV oranýna göre beyanname hacmi ve genel toplam otomatik hesaplanacaktýr.</p>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-all shadow-md mt-2">
                Faturayý Ýmzala ve Gönder
              </button>
            </form>
          )}

          {activeTab === 'GIB_INFO' && (
            <div className="space-y-3 text-slate-600 font-medium text-xs leading-relaxed">
              <h4 className="font-black text-slate-800 text-sm mb-1">Mali Mühür & Schematron Kontrolü</h4>
              <p>
                Sistemimiz, GÝB'in yayýnladýðý en güncel UBL-TR 2.1 standardýyla tam uyumludur.
              </p>
              <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-500 leading-normal">
                {`<?xml version="1.0" encoding="UTF-8"?>`} <br />
                {`<Invoice xmlns="urn:oasis:names:specification..." />`}
              </p>
              <p>
                Oluþturulan her fatura için seçtiðiniz vergi kýrýlýmý iþlenir ve benzersiz bir evrensel kod (UUID) mühürlenir. Bu sayece müþterinize sunum yaparken mali entegrasyon esnekliðimizi net bir þekilde ispat edebiliriz.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}