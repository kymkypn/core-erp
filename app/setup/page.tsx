'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setupFirstAdmin } from '@/app/actions/authActions'

export default function SetupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await setupFirstAdmin(formData)

    if (res.success) {
      // Kurulum başarılıysa doğrudan Dashboard'a (Komuta Merkezine) geçiş yap
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(res.error || "Bilinmeyen bir hata oluştu.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Arka Plan Dekoratif Elementler */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-900/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-900/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Üst Şerit */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
              👑
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sistem İlk Kurulumu</h1>
            <p className="text-sm font-bold text-slate-500 mt-2">Kurucu Yönetici (ADMIN) Hesabı</p>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Ad Soyad</label>
              <input 
                name="name" 
                required 
                placeholder="Örn: Ayhan Öztürk"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Kullanıcı Adı (Giriş İçin)</label>
              <input 
                name="username" 
                required 
                placeholder="Örn: admin"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Şifre (Sisteme Giriş İçin)</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="Güçlü bir şifre belirleyin"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Telefon Numarası</label>
              <input 
                name="phone" 
                required 
                placeholder="05XX XXX XX XX"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full mt-2 text-white font-black text-sm tracking-wide py-4 rounded-xl shadow-lg transition-all ${loading ? 'bg-slate-500' : 'bg-slate-900 hover:bg-emerald-600 hover:shadow-emerald-500/25 hover:-translate-y-0.5'}`}
            >
              {loading ? 'VERİTABANI OLUŞTURULUYOR...' : 'SİSTEMİ KUR VE BAŞLAT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}