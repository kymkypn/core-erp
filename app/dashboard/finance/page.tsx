'use client'

import { useState, useEffect } from 'react'
import { getAccounts, createAccount, createTransaction, getTransactions } from '@/app/actions/financeActions'
import { getCompanies } from '@/app/actions/companyActions'

export default function FinancePage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [txType, setTxType] = useState('COLLECTION')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [accRes, txRes, compRes] = await Promise.all([getAccounts(), getTransactions(), getCompanies()])
    setAccounts(accRes || [])
    setTransactions(txRes || [])
    if (compRes.success) setCompanies(compRes.companies || [])
    setLoading(false)
  }

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createAccount(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset() }
  }

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createTransaction(new FormData(e.currentTarget))
    if (res.success) { loadData(); e.currentTarget.reset() }
    else alert(res.error)
  }

  const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="space-y-8">
      {/* Üst Kısım: Kasalar Özeti ve Yeni Kasa Açma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Toplam Nakit Varlığı</h2>
            <p className="text-4xl font-black mb-6">₺{totalCash.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-slate-400 mb-1 truncate">{acc.name}</p>
                <p className={`font-black ${acc.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ₺{acc.balance.toLocaleString()}
                </p>
                <span className="text-[10px] font-bold bg-slate-700 px-2 py-0.5 rounded uppercase mt-2 inline-block">
                  {acc.type === 'CASH' ? 'NAKİT KASA' : 'BANKA'}
                </span>
              </div>
            ))}
            {accounts.length === 0 && <p className="text-slate-500 text-sm font-medium col-span-2">Henüz kasa eklenmedi.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Yeni Kasa / Banka Tanımla</h3>
          <form onSubmit={handleAddAccount} className="space-y-3">
            <input name="name" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 placeholder-slate-400" placeholder="Örn: Akbank Ticari, Kasa 1" />
            <div className="flex gap-2">
              <select name="type" className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 bg-slate-50 outline-none focus:border-blue-500">
                <option value="BANK">Banka Hesabı</option>
                <option value="CASH">Nakit Kasa</option>
              </select>
              <input name="balance" type="number" step="0.01" className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 placeholder-slate-400" placeholder="Açılış (₺)" />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition-all text-sm">
              Kaydet
            </button>
          </form>
        </div>
      </div>

      {/* Alt Kısım: Yeni İşlem Fişi ve Geçmiş */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol: Yeni Makbuz Kes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm self-start">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-md flex justify-center items-center">💳</span>
            Makbuz / Fiş Kes
          </h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">İşlem Türü</label>
              <select name="type" value={txType} onChange={(e) => setTxType(e.target.value)} className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none bg-slate-50 focus:border-blue-500">
                <option value="COLLECTION">Tahsilat (Müşteriden Para Geldi)</option>
                <option value="PAYMENT">Ödeme (Tedarikçiye Para Gitti)</option>
                <option value="EXPENSE">Gider (Maaş, Fatura, Kira vb.)</option>
                <option value="INCOME">Ek Gelir</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Kasa / Banka?</label>
              <select name="accountId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500">
                {accounts.length === 0 && <option value="">Önce kasa ekleyin</option>}
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Sadece Tahsilat ve Ödemede Cari Seçtir */}
            {(txType === 'COLLECTION' || txType === 'PAYMENT') && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hangi Cari / Firma?</label>
                <select name="companyId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500">
                  <option value="">-- Firma Seçin --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tutar (₺)</label>
              <input name="amount" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-xl text-slate-900 outline-none focus:border-blue-500 placeholder-slate-400" placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Açıklama</label>
              <input name="description" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-blue-500 placeholder-slate-400" placeholder="Örn: 154 Nolu Fatura Ödemesi" />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md">
              İşlemi Onayla ve Kasa/Cari Güncelle
            </button>
          </form>
        </div>

        {/* Sağ: Son İşlemler Tablosu */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Son Kasa / Banka Hareketleri</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-white">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">İşlem</th>
                  <th className="p-4">Firma / Açıklama</th>
                  <th className="p-4">Kasa/Banka</th>
                  <th className="p-4 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Henüz işlem yapılmadı.</td></tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-slate-600 font-medium">{new Date(tx.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          tx.type === 'COLLECTION' ? 'bg-emerald-100 text-emerald-700' :
                          tx.type === 'PAYMENT' ? 'bg-red-100 text-red-700' :
                          tx.type === 'EXPENSE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tx.type === 'COLLECTION' ? 'TAHSİLAT' : tx.type === 'PAYMENT' ? 'ÖDEME' : tx.type === 'EXPENSE' ? 'GİDER' : 'GELİR'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{tx.company?.name || 'Cari Bağımsız'}</p>
                        <p className="text-xs text-slate-500 font-medium">{tx.description}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{tx.account.name}</td>
                      <td className={`p-4 text-right font-black ${
                        (tx.type === 'COLLECTION' || tx.type === 'INCOME') ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {(tx.type === 'COLLECTION' || tx.type === 'INCOME') ? '+' : '-'}₺{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}