import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-blue-600 selection:text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-blue-400 font-black tracking-widest text-sm uppercase mb-3 block">Bize Ulaşın</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Şirketinizi Dönüştürmeye <br /> Hazır Mısınız?
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700">
          
          {/* Sol: İletişim Bilgileri */}
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Merkez Ofis</h2>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
              Sistemi satın almak, mevcut paketinizi yükseltmek veya şirketinize özel sunucu kurulumu talep etmek için uzman ekibimizle iletişime geçin.
            </p>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-slate-300 font-medium">
                <span className="text-2xl">📍</span>
                <div>
                  <strong className="block text-white mb-1">Adres:</strong>
                  Levent Mah. Büyükdere Cad. <br /> Şişli, İstanbul / Türkiye
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-300 font-medium">
                <span className="text-2xl">📞</span>
                <div>
                  <strong className="block text-white mb-1">Telefon:</strong>
                  +90 (850) XXX XX XX
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-300 font-medium">
                <span className="text-2xl">✉️</span>
                <div>
                  <strong className="block text-white mb-1">E-Posta:</strong>
                  satis@coreerp.com
                </div>
              </li>
            </ul>
          </div>

          {/* Sağ: İletişim Formu */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-black text-white mb-6">Demo ve Teklif İste</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Ad Soyad</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Şirket Adı</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">İhtiyacınız (Mesajınız)</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"></textarea>
              </div>
              <button type="button" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg transition-colors uppercase tracking-widest text-sm mt-4">
                Gönder
              </button>
            </form>
          </div>

        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>

      </div>
    </div>
  )
}