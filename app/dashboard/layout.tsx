import { cookies } from 'next/headers'
import Link from 'next/link'
import { logoutUser } from '@/app/actions/authActions'

// 1. TÜM MENÜ ELEMANLARI VE YETKİLİ ROL TANIMLARI
const MENU_ITEMS = [
  { path: '/dashboard', label: '🏠 Panel Özet', roles: ['*'] },
  { path: '/dashboard/finance', label: '💵 Kasa & Finans', roles: ['ADMIN', 'COORDINATOR', 'FINANCE'] },
  { path: '/dashboard/companies', label: '👥 Cari Hesaplar', roles: ['ADMIN', 'COORDINATOR', 'FINANCE', 'SALES', 'PURCHASING'] },
  { path: '/dashboard/invoices', label: '🧾 e-Fatura & e-Arşiv', roles: ['ADMIN', 'COORDINATOR', 'FINANCE', 'PURCHASING'] },
  { path: '/dashboard/hr', label: '📌 İK & Personel Bordro', roles: ['ADMIN', 'COORDINATOR', 'HR'] },
  { path: '/dashboard/crm', label: '📈 CRM & Satış Hunisi', roles: ['ADMIN', 'COORDINATOR', 'SALES'] },
  { path: '/dashboard/b2b-portal', label: '🚨 B2B Bayi Portalı', roles: ['ADMIN', 'COORDINATOR', 'SALES'] },
  { path: '/dashboard/ecommerce', label: '🌐 E-Ticaret Hub (API)', roles: ['ADMIN', 'COORDINATOR', 'SALES', 'WAREHOUSE_MANAGER'] },
  { path: '/dashboard/products', label: '📦 Ürün & Stok Yönetimi', roles: ['ADMIN', 'COORDINATOR', 'PURCHASING', 'WAREHOUSE_MANAGER'] },
  { path: '/dashboard/excel', label: '📊 Excel İçe Aktarım', roles: ['ADMIN', 'COORDINATOR', 'PURCHASING', 'WAREHOUSE_MANAGER'] },
  { path: '/dashboard/recipes', label: '⚙️ Üretim & Reçete (BOM)', roles: ['ADMIN', 'COORDINATOR', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF'] },
  { path: '/dashboard/vehicles', label: '🚛 Araç & Filo Takibi', roles: ['ADMIN', 'COORDINATOR', 'FINANCE', 'PURCHASING', 'WAREHOUSE_MANAGER'] },
  { path: '/dashboard/terminal', label: '📱 El Terminali', roles: ['ADMIN', 'COORDINATOR', 'WAREHOUSE_RECEIVING' ,'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF'] },
  { path: '/dashboard/logs', label: '🛡️ SIEM Güvenlik Logları', roles: ['ADMIN'] },
  { path: '/dashboard/users', label: '🔐 Kullanıcı Yetkileri', roles: ['ADMIN'] },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 2. SUNUCU TARAFINDA OTURUM ÇEREZİNİ OKUYORUZ
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('erp_session')
  
  let userSession = { name: 'Misafir', role: 'YOK' }
  if (sessionCookie) {
    try {
      userSession = JSON.parse(sessionCookie.value)
    } catch (e) {
      // Çerez formatı hatalıysa varsayılan değerde kalır
    }
  }

  const { name, role } = userSession

  // 3. KULLANICININ ROLÜNE GÖRE MENÜYÜ FİLTRELEYEN SİHRALİ SÜZGEÇ
  const filteredMenu = MENU_ITEMS.filter(item => {
    if (item.roles.includes('*')) return true // Herkese açık sayfalar
    if (role === 'ADMIN' || role === 'COORDINATOR') return true // Tam yetkili süper roller
    return item.roles.includes(role) // Rol eşleşmesi kontrolü
  })

  // Rol isimlerini ekranda daha şık göstermek için küçük bir yardımcı
  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'Sistem Sahibi'
      case 'COORDINATOR': return 'Genel Koordinatör'
      case 'FINANCE': return 'Finans Sorumlusu'
      case 'HR': return 'İK Müdürü'
      case 'SALES': return 'Satış Sorumlusu'
      case 'PURCHASING': return 'Satınalma Müdürü'
      case 'WAREHOUSE_MANAGER': return 'Depo Müdürü'
      case 'WAREHOUSE_STAFF': return 'Saha Operasyon'
	  case 'WAREHOUSE_RECEIVING': return 'Mal Kabul Sorumlusu'
      default: return r
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 md:sticky md:top-0 md:h-screen shadow-xl border-r border-slate-800 relative z-20">
        <div className="space-y-6">
          
          {/* Logo & Kurumsal Başlık */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-md text-white font-black">
              Ω
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase">CORE ERP</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">V3 Enterprise</p>
            </div>
          </div>

          {/* Aktif Kullanıcı Kartı */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/60">
            <p className="text-xs font-black text-white truncate">{name}</p>
            <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase block mt-1 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/40 w-fit">
              ✦ {getRoleLabel(role)}
            </span>
          </div>

          {/* DİNAMİK OLARAK FİLTRELENMİŞ NAVİGASYON LİNKLERİ */}
          <nav className="space-y-1 overflow-y-auto max-h-[55vh] custom-scrollbar pr-1">
            {filteredMenu.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className="flex items-center px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all hover:bg-slate-800 hover:text-white group"
              >
                <span className="opacity-40 group-hover:opacity-100 transition-opacity mr-2.5">
                  •
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Alt Kısım: Güvenli Çıkış */}
        <div className="pt-4 border-t border-slate-800 mt-4">
          <form action={logoutUser}>
            <button 
              type="submit"
              className="w-full bg-slate-950 hover:bg-red-950/40 hover:text-red-400 text-slate-400 border border-slate-800 hover:border-red-900/50 font-black text-[11px] uppercase tracking-widest py-3 rounded-xl shadow-sm transition-all text-center block"
            >
              🚪 Oturumu Kapat
            </button>
          </form>
        </div>
      </aside>

      {/* SAĞ KISIM: SAYFA İÇERİKLERİ (MAIN CONTENT) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden relative z-10">
        {children}
      </main>

    </div>
  )
}