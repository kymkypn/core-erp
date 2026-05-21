import Link from 'next/link'

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Üst Başlık */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black tracking-widest text-sm uppercase mb-3 block">Hakkımızda</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Türkiye'nin Yeni Nesil <br /> İşletme Altyapısı.
          </h1>
        </div>

        {/* Hikaye ve Vizyon */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 prose prose-lg prose-slate max-w-none">
          <p className="text-xl font-medium text-slate-600 leading-relaxed mb-8">
            CORE ERP, hantal ve öğrenilmesi aylar süren eski nesil muhasebe programlarına bir tepki olarak İstanbul'da geliştirildi. Amacımız, en karmaşık üretim ve lojistik süreçlerini bile bir cep telefonu uygulamasını kullanmak kadar basit hale getirmektir.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">🎯 Vizyonumuz</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Sahadaki depo personelinden, merkez ofisteki finans müdürüne kadar herkesin aynı dili konuştuğu, sıfır veri kaybıyla çalışan entegre şirketler inşa etmek.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">🛡️ Veri Güvenliği</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Sistemimiz askeri standartlarda 256-bit şifreleme ve gelişmiş SIEM loglaması ile korunur. Verileriniz KVKK standartlarına uygun olarak Türkiye'deki sunucularımızda yedeklenir.</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mt-12 mb-4">Uzmanlıkların Birleşimi</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            Bu sistem sadece masa başında yazılmış bir kod yığını değildir. Yıllarını depo yönetimine, tekstil üretim bantlarına, kalite kontrole ve tedarik zinciri optimizasyonuna vermiş saha profesyonellerinin tecrübeleriyle, ileri düzey yazılım mühendisliğinin mükemmel birleşimidir. Bu yüzden sistem, bir depo işçisinin "Burada neye basacağım?" demesine fırsat vermeyecek kadar içgüdüsel çalışır.
          </p>
        </div>

        {/* Geri Dönüş Butonu */}
        <div className="mt-10 text-center">
          <Link href="/" className="text-sm font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>

      </div>
    </div>
  )
}