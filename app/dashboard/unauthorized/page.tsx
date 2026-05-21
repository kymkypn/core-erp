'use client'

import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner border border-red-200">
        ⛔
      </div>
      
      <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
        Erişim Engellendi
      </h1>
      
      <p className="text-slate-500 font-bold max-w-md mb-8">
        Şu anda bulunduğunuz departman (rol) yetkileri dahilinde bu modüle giriş izniniz bulunmamaktadır. Bu deneme sistem güvenlik kayıtlarına (SIEM) işlenmiştir.
      </p>
      
      <button 
        onClick={() => router.push('/dashboard')}
        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-0.5"
      >
        Ana Ekrana Geri Dön
      </button>
    </div>
  )
}