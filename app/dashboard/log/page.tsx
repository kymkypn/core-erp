'use client'

import { useState, useEffect } from 'react'
import { getSecurityLogs, generateDemoLogs } from '@/app/actions/logActions'

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await getSecurityLogs()
    if (res.success) setLogs(res.logs || [])
    setLoading(false)
  }

  const handleGenerateDemo = async () => {
    const res = await generateDemoLogs()
    if (res.success) {
      await loadData()
      alert("Demo güvenlik logları sisteme başarıyla işlendi. İzler canlı olarak akıyor!")
    }
  }

  // Log tiplerine göre renk belirleme
  const getActionStyle = (action: string) => {
    if (action.includes('SILINDI') || action.includes('IPTAL')) {
      return 'bg-red-100 text-red-700 border-red-300'
    }
    if (action.includes('GUNCELLE') || action.includes('DEGISIM')) {
      return 'bg-amber-100 text-amber-700 border-amber-300'
    }
    return 'bg-blue-100 text-blue-700 border-blue-300'
  }

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">Güvenlik Duvarı Yükleniyor...</div>

  return (
    <div className="space-y-6">
      
      {/* ÜST BAŞLIK VE HIZLI DEMO BUTONU */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            🛡️ SIEM & Güvenlik Denetim Günlükleri
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Sistem üzerinde gerçekleşen tüm kritik veri hareketleri, silme ve güncelleme işlemleri geriye dönük olarak mühürlenir.
          </p>
        </div>
        <button 
          onClick={handleGenerateDemo}
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md transition-all self-stretch sm:self-auto text-center"
        >
          🚨 Sızma / Hareket Simüle Et
        </button>
      </div>

      {/* CANLI AKIŞ TABLOSU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Geriye Dönük İz Kayıtları (Audit Trail)</h3>
          <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Son 100 İşlem</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                <th className="p-4">Zaman Damgası</th>
                <th className="p-4">Modül</th>
                <th className="p-4">Eylem / Olay</th>
                <th className="p-4">Detaylı İz Açıklaması</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-bold font-sans">
                    Henüz hiçbir şüpheli veya kritik sistem hareketi kaydedilmedi. Üstteki butondan simülasyon başlatabilirsiniz.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-slate-500 font-sans font-bold w-48">
                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-sans font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}