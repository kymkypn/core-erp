'use client'

import { useState, useEffect } from 'react'
import { getCompanies, createCompany } from '@/app/actions/companyActions'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchList() }, [])

  const fetchList = async () => {
    const res = await getCompanies()
    if (res.success) setCompanies(res.companies || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await createCompany(formData)
    if (res.success) {
      fetchList()
      e.currentTarget.reset()
    } else {
      setError(res.error || 'Hata oluştu')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Cari Kart Listesi */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Müşteri ve Tedarikçi Portföyü</h2>
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {companies.length} Kayıtlı Cari
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Firma / Kişi Adı</th>
                <th className="p-4">Tür</th>
                <th className="p-4">İletişim</th>
                <th className="p-4 text-right">Güncel Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                  <td className="p-4 font-bold text-slate-800">{c.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                      c.type === 'CUSTOMER' ? 'bg-blue-100 text-blue-700' : 
                      c.type === 'SUPPLIER' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {c.type === 'CUSTOMER' ? 'MÜŞTERİ' : c.type === 'SUPPLIER' ? 'TEDARİKÇİ' : 'HEPSİ'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-600">
                    <div>{c.phone}</div>
                    <div className="opacity-60">{c.email}</div>
                  </td>
                  <td className={`p-4 text-right font-black ${c.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₺{c.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Cari Kaydı */}
      <div className="w-full lg:w-[350px]">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">+</span>
             Yeni Cari Kart Aç
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Firma / Şahıs Adı</label>
              <input name="name" required className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Cari Türü</label>
              <select name="type" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 bg-slate-50">
                <option value="CUSTOMER">Müşteri (Satış Yapılan)</option>
                <option value="SUPPLIER">Tedarikçi (Mal Alınan)</option>
                <option value="BOTH">Her İkisi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Telefon</label>
              <input name="phone" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">E-Posta</label>
              <input name="email" type="email" className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none" />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all">
              Cari Kartı Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}