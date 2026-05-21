'use client'

import { useState, useEffect } from 'react'
import { getEmployees, createEmployee, createPayrollEntry, createLeaveEntry } from '@/app/actions/hrActions'
import { getAccounts } from '@/app/actions/financeActions'

export default function HRPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW_EMP' | 'PAYROLL' | 'LEAVE'>('PAYROLL')
  const [isPaidChecked, setIsPaidChecked] = useState(true)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [empRes, accRes] = await Promise.all([getEmployees(), getAccounts()])
    if (empRes.success) setEmployees(empRes.employees || [])
    setAccounts(accRes || [])
    setLoading(false)
  }

  // --- FORM GÖNDERİM İŞLEMLERİ ---
  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createEmployee(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Personel başarıyla eklendi.") }
    else alert(res.error)
  }

  const handleAddPayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createPayrollEntry(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("Bordro/Ödeme işlemi kaydedildi.") }
    else alert(res.error)
  }

  const handleAddLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createLeaveEntry(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset(); alert("İzin sisteme işlendi.") }
    else alert(res.error)
  }

  // --- HESAPLAMALAR ---
  const totalEmployees = employees.length
  const totalBaseSalaries = employees.reduce((sum, emp) => sum + emp.baseSalary, 0)
  
  // Bu ay verilen toplam avansları bul
  const totalAdvancesThisMonth = employees.reduce((sum, emp) => {
    const advances = emp.payrolls.filter((p: any) => p.type === 'ADVANCE' && p.month === currentMonth && p.year === currentYear)
    return sum + advances.reduce((s: number, a: any) => s + a.amount, 0)
  }, 0)

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">İK Modülü Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: PERSONEL LİSTESİ VE ÖZET */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Aktif Personel</h3>
            <p className="text-3xl font-black">{totalEmployees} <span className="text-sm font-medium text-slate-500">Kişi</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold text-xs tracking-widest uppercase mb-1">Aylık Sabit Maaş Yükü</h3>
            <p className="text-3xl font-black text-slate-800">₺{totalBaseSalaries.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-orange-500 font-bold text-xs tracking-widest uppercase mb-1">Bu Ay Verilen Avans</h3>
            <p className="text-3xl font-black text-orange-600">₺{totalAdvancesThisMonth.toLocaleString()}</p>
          </div>
        </div>

        {/* Personel Tablosu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Personel Kadrosu ve Bordro Durumu</h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">Ay: {currentMonth}/{currentYear}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Personel Bilgisi</th>
                  <th className="p-4">Departman / Görev</th>
                  <th className="p-4">Kök Maaş</th>
                  <th className="p-4 text-orange-600">Bu Ayki Avans</th>
                  <th className="p-4 text-emerald-600">Kalan Net Ödeme</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Henüz personel eklenmedi.</td></tr>
                ) : (
                  employees.map(emp => {
                    // Hesaplamalar
                    const empAdvances = emp.payrolls
                      .filter((p:any) => p.type === 'ADVANCE' && p.month === currentMonth && p.year === currentYear)
                      .reduce((s:number, a:any) => s + a.amount, 0)
                    const netToPay = emp.baseSalary - empAdvances

                    return (
                      <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-black text-slate-800 text-base">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-slate-500 font-medium">TC: {emp.tcNo || 'Belirtilmedi'} | 📞 {emp.phone || '-'}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{emp.department}</span>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{emp.position}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-700">₺{emp.baseSalary.toLocaleString()}</td>
                        <td className="p-4 font-black text-orange-600">{empAdvances > 0 ? `- ₺${empAdvances.toLocaleString()}` : '-'}</td>
                        <td className="p-4 font-black text-emerald-600 text-lg">₺{netToPay.toLocaleString()}</td>
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
          <button onClick={() => setActiveTab('PAYROLL')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'PAYROLL' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Maaş / Avans
          </button>
          <button onClick={() => setActiveTab('NEW_EMP')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_EMP' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            Yeni Kayıt
          </button>
          <button onClick={() => setActiveTab('LEAVE')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'LEAVE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
            İzin Gir
          </button>
        </div>

        <div className="p-6">
          
          {/* SEKME 1: MAAŞ / AVANS ÖDEMESİ */}
          {activeTab === 'PAYROLL' && (
            <form onSubmit={handleAddPayroll} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">💸 Finansal İşlem (Bordro)</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Personel Seçin</label>
                <select name="employeeId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 bg-slate-50">
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.department})</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">İşlem Türü</label>
                  <select name="type" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500">
                    <option value="ADVANCE">Avans Kesintisi</option>
                    <option value="SALARY">Maaş Ödemesi</option>
                    <option value="BONUS">Prim / Ödül</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Dönem (Ay)</label>
                  <input name="month" type="number" defaultValue={currentMonth} min={1} max={12} required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none text-center" />
                </div>
              </div>
              <input type="hidden" name="year" value={currentYear} />

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tutar (₺)</label>
                <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-xl text-slate-900 outline-none focus:border-blue-500" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Açıklama</label>
                <input name="description" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Örn: Nakit Avans, Mesai Primi" />
              </div>

              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isPaid" value="true" checked={isPaidChecked} onChange={(e) => setIsPaidChecked(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-bold text-slate-800">Bu Tutar Kasadan Çıktı (Ödendi)</span>
                </label>
                
                {isPaidChecked && (
                  <select name="accountId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-xs text-slate-900 outline-none">
                    <option value="">-- Hangi Kasadan Ödendi? --</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bakiye: ₺{a.balance})</option>)}
                  </select>
                )}
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md">
                İşlemi Kaydet ve Hesapla
              </button>
            </form>
          )}

          {/* SEKME 2: YENİ PERSONEL EKLE */}
          {activeTab === 'NEW_EMP' && (
            <form onSubmit={handleAddEmployee} className="space-y-3">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">👔 Personel Kartı Açılışı</h3>
              <div className="flex gap-2">
                <input name="firstName" required className="w-1/2 px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Adı" />
                <input name="lastName" required className="w-1/2 px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Soyadı" />
              </div>
              <input name="tcNo" className="w-full px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="T.C. Kimlik No" />
              <div className="flex gap-2">
                <select name="department" className="w-1/2 px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                  <option value="Yönetim">Yönetim</option>
                  <option value="Lojistik">Lojistik / Depo</option>
                  <option value="Üretim">Üretim</option>
                  <option value="Satış">Satış / Pazarlama</option>
                </select>
                <input name="position" required className="w-1/2 px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Görev/Ünvan" />
              </div>
              <input name="phone" className="w-full px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Telefon Numarası" />
              
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 mb-1">Aylık Kök (Sabit) Maaş (₺)</label>
                <input name="baseSalary" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-lg text-slate-900 outline-none focus:border-blue-500" placeholder="0.00" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-all">Sisteme Kaydet</button>
            </form>
          )}

          {/* SEKME 3: İZİN GİRİŞİ */}
          {activeTab === 'LEAVE' && (
            <form onSubmit={handleAddLeave} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🏖️ İzin & Rapor Girişi</h3>
              <select name="employeeId" required className="w-full px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                <option value="">-- Personel Seçin --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <select name="type" required className="w-full px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none bg-slate-50">
                <option value="Yıllık İzin">Yıllık İzin</option>
                <option value="Sağlık Raporu">Sağlık Raporu</option>
                <option value="Mazeret İzni">Mazeret İzni</option>
              </select>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Başlangıç</label>
                  <input type="date" name="startDate" required className="w-full px-3 py-2 border-2 rounded-lg font-bold text-xs text-slate-900 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Bitiş</label>
                  <input type="date" name="endDate" required className="w-full px-3 py-2 border-2 rounded-lg font-bold text-xs text-slate-900 outline-none" />
                </div>
              </div>
              <input name="description" className="w-full px-3 py-2 border-2 rounded-lg font-bold text-sm text-slate-900 outline-none" placeholder="Açıklama (Opsiyonel)" />
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-500 transition-all shadow-md">İzni Onayla ve İşle</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}