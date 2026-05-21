'use client'

import { useState, useEffect } from 'react'
import { getAuditLogs, deleteRecord } from '@/app/actions/adminActions'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const data = await getAuditLogs()
    setLogs(data || [])
    setLoading(false)
  }

  const handleDelete = async (module: string, id: string) => {
    // Yanlışlıkla basılmalara karşı kesin güvenlik uyarısı
    const confirmMessage = "⚠️ DİKKAT!\n\nBu işlemi silmek, ilgili cari bakiyelerini, kasayı ve stokları OTOMATİK OLARAK GERİ ALACAKTIR.\n\nEmin misiniz?"
    if (!window.confirm(confirmMessage)) return

    const res = await deleteRecord(module, id)
    if (res.success) {
      alert("İşlem başarıyla silindi ve tüm hesaplar eski haline döndürüldü.")
      loadLogs()
    } else {
      alert("Hata: " + res.error)
    }
  }

  if (loading) return <div className="p-8 font-bold text-slate-500">Sistem kayıtları yükleniyor...</div>

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-2xl shadow-sm">
        <h2 className="text-red-800 font-black text-xl mb-2 flex items-center gap-2">
          🛡️ Sistem Denetim ve Hata Düzeltme Merkezi (Admin)
        </h2>
        <p className="text-red-700 font-medium text-sm">
          Aşağıdaki listeden silinen herhangi bir işlem sadece veritabanından kalkmaz; o işlemin yarattığı tüm <b>Stok, Bakiye ve Kasa etkileri de geriye alınır.</b> Lütfen bu ekranı dikkatli kullanın.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase text-xs">
              <th className="p-4">Tarih</th>
              <th className="p-4">Modül / İşlem Tipi</th>
              <th className="p-4">İşlem Detayları (Firma / Ürün / Kasa)</th>
              <th className="p-4 font-black">Değer (Tutar/Adet)</th>
              <th className="p-4 text-center">Yönetici İşlemi</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Kayıt bulunamadı.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 font-bold text-xs">{new Date(log.date).toLocaleString('tr-TR')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${log.color}`}>
                      {log.title}
                    </span>
                    {log.status === 'PENDING' && <span className="ml-2 text-[10px] text-orange-600 font-bold italic">Bekliyor</span>}
                  </td>
                  <td className="p-4 font-medium text-slate-700">{log.desc}</td>
                  <td className="p-4 font-black text-slate-900">{log.value}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(log.module, log.id)}
                      className="bg-red-100 hover:bg-red-600 text-red-700 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      İptal Et / Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}