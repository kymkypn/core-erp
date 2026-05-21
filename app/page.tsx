import Link from 'next/link'

export default function SoftwareLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white scroll-smooth">
      
      {/* 1. ÜST MENÜ (NAVBAR) */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-md text-white font-black">
              Ω
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">CORE<span className="text-blue-600">ERP</span></span>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
            <a href="/#ozellikler" className="hover:text-blue-600 transition-colors">Modüller</a>
            <Link href="/kurumsal" className="hover:text-blue-600 transition-colors">Kurumsal</Link>
            <Link href="/iletisim" className="hover:text-blue-600 transition-colors">İletişim</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-black text-slate-600 hover:text-slate-900 uppercase tracking-widest hidden sm:block">
              Müşteri Girişi
            </Link>
            <Link href="/setup" className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5">
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ANA KARŞILAMA (HERO SECTION) */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-400/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black tracking-widest uppercase mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          V3 Enterprise Yayında
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 relative z-10 max-w-5xl mx-auto">
          Şirketinizi Excel'den Kurtarın, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Geleceğe Taşıyın.
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
          Uçtan uca e-Dönüşüm, El Terminali ile Depo Yönetimi, Üretim (BOM) Planlaması ve B2B Sipariş Ağınızı tek bir bulut platformundan yönetin. Eski hantal ERP'leri unutun.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Link href="/setup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1">
            Kendi Sistemini Kur
          </Link>
          <a href="#ozellikler" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-sm transition-all">
            Sistemi İncele
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-20 relative mx-auto max-w-6xl">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
          <div className="bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200">
            <div className="bg-slate-900 rounded-[1.5rem] p-6 aspect-[16/9] relative overflow-hidden flex items-center justify-center border border-slate-800">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
              <h2 className="text-3xl md:text-5xl font-black text-white z-10 tracking-widest uppercase opacity-50">Sistem Arayüzü</h2>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MODÜLLER VE ÖZELLİKLER */}
      <section id="ozellikler" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Her Departman İçin Tam Kontrol</h2>
            <p className="text-slate-500 font-medium">Satıştan üretime, muhasebeden depoya kadar tüm süreçleriniz birbiriyle konuşur. Sıfır veri kaybı, maksimum verim.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon="📱" title="Mobil El Terminali (WMS)" 
              desc="Depo personeliniz için devasa butonlu özel arayüz. Barkod okutarak mal kabul, sevk ve sayım işlemlerini saniyeler içinde hatasız yapın." 
            />
            <FeatureCard 
              icon="🧾" title="e-Fatura & Ön Muhasebe" 
              desc="GİB entegrasyonu ile tek tıkla e-fatura mühürleme. Kasa, banka, cari bakiye takibi ve resmi %1, %10, %20 KDV kırılımlı hesaplamalar." 
            />
            <FeatureCard 
              icon="⚙️" title="Üretim Reçeteleri (BOM)" 
              desc="Karmaşık imalat süreçleri için ürün reçeteleri oluşturun. Üretim bandından çıkan her ürün için hammaddeler stoktan otomatik düşsün." 
            />
            <FeatureCard 
              icon="🛒" title="E-Ticaret & Pazaryeri API" 
              desc="Trendyol, Amazon, Hepsiburada ve kendi B2B sitenizden gelen siparişler tek ekrana düşer. Stoklarınız tüm platformlarda anlık güncellenir." 
            />
            <FeatureCard 
              icon="👥" title="Gelişmiş İK & Rol Yönetimi" 
              desc="İşçiye sadece depo ekranını, muhasebeciye sadece kasayı gösterin (RBAC). Güvenlik açıklarını kapatın, avans ve bordroları yönetin." 
            />
            <FeatureCard 
              icon="🛡️" title="SIEM Siber Güvenlik Logları" 
              desc="Sistemdeki her tıklama, her stok hareketi kimin tarafından ne zaman yapıldı kayıt altına alınır. Geriye dönük %100 izlenebilirlik." 
            />
          </div>
        </div>
      </section>

      {/* 4. KİMLER İÇİN TASARLANDI? */}
      <section id="kimler-icin" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Hangi İşletmelere Değer Katar?</h2>
            <p className="text-slate-400 font-medium">Core ERP, büyümekte olan KOBİ'ler ve kurumsal operasyonlar için özel olarak mimarilendirildi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex gap-6">
              <div className="text-5xl">🏭</div>
              <div>
                <h3 className="text-xl font-black mb-2 text-white">İmalat ve Fabrikalar</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Hammaddeden mamule geçiş sürecini takip etmek isteyen, fire maliyetlerini kısmak ve üretim planlaması yapmak isteyen tüm atölye ve fabrikalar için idealdir.</p>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex gap-6">
              <div className="text-5xl">📦</div>
              <div>
                <h3 className="text-xl font-black mb-2 text-white">Lojistik ve Toptancılar</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Geniş ürün gamı olan, araç filosu yöneten, bayilerine (B2B) özel fiyatlar sunup sipariş toplayan toptancı ve distribütör firmalar için kusursuzdur.</p>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex gap-6">
              <div className="text-5xl">🌐</div>
              <div>
                <h3 className="text-xl font-black mb-2 text-white">E-Ticaret Satıcıları</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Birden fazla pazaryerinde satış yapan, "stoğum bitti ama satış gelmiş" cezasından korkan ve sipariş paketleme sürecini hızlandırmak isteyen e-ticaret markaları.</p>
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex gap-6">
              <div className="text-5xl">🏢</div>
              <div>
                <h3 className="text-xl font-black mb-2 text-white">Merkez Ofisler</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Sahadaki personelin, depodaki işçinin ve sahadaki plasiyerin ne yaptığını tek bir ekrandan anlık, canlı raporlarla izlemek isteyen patronlar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FİYATLANDIRMA (PRICING) */}
      <section id="fiyatlandirma" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Şirketinize Uygun Çözümü Seçin</h2>
            <p className="text-slate-500 font-medium">Gizli maliyet yok, donanım yatırımı yok. Sadece kullandığınız kadar ödeyin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {/* Paket 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-2">Başlangıç</h3>
              <p className="text-sm text-slate-500 font-medium h-10">Ofisler ve küçük işletmeler için temel ön muhasebe.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900">₺2.500</span>
                <span className="text-slate-500 text-sm font-bold"> /aylık</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm font-medium text-slate-600">
                <li className="flex items-center gap-2">✅ Cari ve Kasa Takibi</li>
                <li className="flex items-center gap-2">✅ e-Fatura Entegrasyonu</li>
                <li className="flex items-center gap-2">✅ Maksimum 5 Kullanıcı</li>
                <li className="flex items-center gap-2 text-slate-400 line-through">❌ El Terminali / Barkod</li>
                <li className="flex items-center gap-2 text-slate-400 line-through">❌ Üretim ve Reçete (BOM)</li>
              </ul>
              <Link href="/setup" className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors">
                Hemen Başla
              </Link>
            </div>

            {/* Paket 2 (Vurgulanan) */}
            <div className="bg-slate-900 p-8 rounded-3xl border-2 border-blue-500 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                En Çok Tercih Edilen
              </div>
              <h3 className="text-xl font-black text-white mb-2">Profesyonel</h3>
              <p className="text-slate-400 text-sm font-medium h-10">Üretim yapan ve deposu olan KOBİ'ler için uçtan uca otomasyon.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white">₺7.500</span>
                <span className="text-slate-400 text-sm font-bold"> /aylık</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm font-medium text-slate-300">
                <li className="flex items-center gap-2">✅ Başlangıç Paketi Dahil</li>
                <li className="flex items-center gap-2">✅ <span className="text-blue-400 font-bold">El Terminali Arayüzü</span></li>
                <li className="flex items-center gap-2">✅ <span className="text-blue-400 font-bold">Üretim & Reçete (BOM)</span></li>
                <li className="flex items-center gap-2">✅ 15 Kullanıcıya Kadar</li>
                <li className="flex items-center gap-2">✅ E-Ticaret Sipariş Havuzu</li>
              </ul>
              <Link href="/setup" className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-1">
                Ücretsiz Test Et
              </Link>
            </div>

            {/* Paket 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-2">Kurumsal (Holding)</h3>
              <p className="text-sm text-slate-500 font-medium h-10">Kendi sunucunuzda, limitlere takılmadan sınırsız operasyon.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900">Teklif Alın</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm font-medium text-slate-600">
                <li className="flex items-center gap-2">✅ Tüm Modüller Açık</li>
                <li className="flex items-center gap-2">✅ B2B Bayi Portalı</li>
                <li className="flex items-center gap-2">✅ Kendi Sunucunuza Kurulum</li>
                <li className="flex items-center gap-2">✅ Sınırsız Kullanıcı</li>
                <li className="flex items-center gap-2">✅ Özel API Geliştirme</li>
              </ul>
              <a href="mailto:iletisim@coreerp.com" className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors">
                Bize Ulaşın
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ÇAĞRI VE FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight mb-6">
            Yazılımı İncelemeye Hazır Mısınız?
          </h2>
          <p className="text-slate-400 mb-10 font-medium max-w-xl mx-auto">
            Hiçbir kredi kartı bilgisi girmeden, ilk "Yönetici" hesabınızı oluşturun ve sistemin gücünü kendi gözlerinizle test edin.
          </p>
          <Link href="/setup" className="inline-block bg-white text-slate-900 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all hover:-translate-y-1">
            Kurulum Sihirbazına Git
          </Link>

          <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest gap-4">
            <p>© {new Date().getFullYear()} CORE ERP. Yazılım Çözümleri.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">KVKK Aydınlatma</a>
              <a href="#" className="hover:text-white transition-colors">Kullanıcı Sözleşmesi</a>
              <a href="#" className="hover:text-white transition-colors">Bayilik Başvurusu</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

// Kart tasarımı için küçük bir UI bileşeni
function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-lg hover:border-blue-200 transition-all duration-300">
      <div className="w-14 h-14 bg-white border border-slate-200 text-slate-700 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-3">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  )
}