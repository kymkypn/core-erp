'use client'

import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUserRole, deleteUser } from '@/app/actions/userActions'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW_USER' | 'INFO'>('NEW_USER')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const res = await getUsers()
    if (res.success) setUsers(res.users || [])
    setLoading(false)
  }

  // --- FORM VE AKSİYON İŞLEMLERİ ---
  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await createUser(new FormData(e.currentTarget))
    if (res.success) { 
      loadData()
      e.currentTarget.reset()
      alert("Yeni personel sisteme yetkileriyle birlikte eklendi!") 
    } else alert(res.error)
  }

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === 'ADMIN') return alert("Güvenlik İhlali: Sistem yöneticisinin yetkisi bu ekrandan düşürülemez!")
    if (!confirm(`Kullanıcının yetkisini ${newRole} olarak değiştirmek istediğinize emin misiniz?`)) return
    
    const res = await updateUserRole(userId, newRole as any)
    if (res.success) { loadData(); alert("Kullanıcı yetkisi başarıyla güncellendi.") }
    else alert(res.error)
  }

  const handleDelete = async (userId: string, role: string) => {
    if (role === 'ADMIN') return alert("Güvenlik İhlali: Sistem yöneticisi hesabı silinemez!")
    if (!confirm("Bu kullanıcının sisteme erişimini kalıcı olarak iptal etmek istiyor musunuz?")) return
    
    const res = await deleteUser(userId)
    if (res.success) { loadData(); alert("Kullanıcı sistemden uzaklaştırıldı.") }
    else alert(res.error)
  }

  // --- UI YARDIMCILARI (Renkler ve Badge'ler) ---
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-purple-200">👑 SİSTEM YÖNETİCİSİ</span>
      case 'COORDINATOR': return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-indigo-200">🌟 SÜPER KULLANICI</span>
      case 'FINANCE': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-emerald-200">💵 FİNANS & MUHASEBE</span>
      case 'HR': return <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-pink-200">👥 İNSAN KAYNAKLARI</span>
      case 'SALES': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-blue-200">💼 SATIŞ MÜDÜRÜ</span>
      case 'PURCHASING': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-amber-200">🛒 SATINALMA</span>
      case 'WAREHOUSE_MANAGER': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-orange-200">🏭 DEPO MÜDÜRÜ</span>
      case 'WAREHOUSE_RECEIVING': return <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-teal-200">📥 MAL KABUL SORUMLUSU</span>
      case 'WAREHOUSE_STAFF': return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-widest border border-slate-300">📤 DEPO / TOPLAYICI</span>
      default: return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] uppercase">{role}</span>
    }
  }

  if (loading) return <div className="p-8 font-bold text-slate-500 animate-pulse">Erişim Yönetim Merkezi Yükleniyor...</div>

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* SOL KISIM: KULLANICI LİSTESİ VE TABLO */}
      <div className="flex-1 space-y-6">
        
        {/* Üst Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-1">Toplam Sistem Kullanıcısı</h3>
            <p className="text-3xl font-black">{users.length} <span className="text-sm font-medium text-slate-500">Personel</span></p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-200">
            <h3 className="text-emerald-600 font-bold text-xs tracking-widest uppercase mb-1">2FA Korumalı Hesaplar</h3>
            <p className="text-3xl font-black text-emerald-700">
              {users.filter(u => u.isTwoFactorActive).length} <span className="text-sm font-medium text-emerald-400">Aktif</span>
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-200">
            <h3 className="text-red-600 font-bold text-xs tracking-widest uppercase mb-1">Zafiyet! 2FA Pasif Hesaplar</h3>
            <p className="text-3xl font-black text-red-700">
              {users.filter(u => !u.isTwoFactorActive).length} <span className="text-sm font-medium text-red-400">Riskli</span>
            </p>
          </div>
        </div>

        {/* Kullanıcılar Tablosu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-purple-500">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">🔐 Sistem Erişim Listesi (RBAC)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white">
                  <th className="p-4">Personel Adı</th>
                  <th className="p-4">Kullanıcı Adı / Telefon</th>
                  <th className="p-4">Departman (Sistem Rolü)</th>
                  <th className="p-4">2FA Güvenliği</th>
                  <th className="p-4 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-slate-800 text-sm">
                      {user.name}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-blue-600 text-xs">@{user.username}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">{user.phone}</p>
                    </td>
                    <td className="p-4">
                      {/* Yetki Değiştirme Dropdown (Admin Korumalı) */}
                      {user.role === 'ADMIN' ? (
                        getRoleBadge(user.role)
                      ) : (
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-bold px-2 py-1.5 rounded outline-none cursor-pointer hover:border-slate-300"
                        >
                          <option value="COORDINATOR">🌟 Süper Kullanıcı</option>
                          <option value="FINANCE">💵 Finans & Muhasebe</option>
                          <option value="HR">👥 İnsan Kaynakları</option>
                          <option value="SALES">💼 Satış Müdürü</option>
                          <option value="PURCHASING">🛒 Satınalma</option>
                          <option value="WAREHOUSE_MANAGER">🏭 Depo Müdürü</option>
                          <option value="WAREHOUSE_RECEIVING">📥 Mal Kabul Sorumlusu</option>
                          <option value="WAREHOUSE_STAFF">📤 Depo Sipariş Toplayıcı</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      {user.isTwoFactorActive ? (
                        <span className="text-emerald-600 font-black text-xs flex items-center gap-1">✅ Aktif</span>
                      ) : (
                        <span className="text-red-500 font-bold text-xs flex items-center gap-1 animate-pulse">⚠️ Pasif</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'ADMIN' && (
                        <button onClick={() => handleDelete(user.id, user.role)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded shadow-sm transition-colors">
                          Sistemden At
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SAĞ KISIM: KULLANICI EKLEME FORMU */}
      <div className="w-full xl:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-6">
        
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('NEW_USER')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'NEW_USER' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-400 hover:text-slate-700'}`}>
            + Kullanıcı Tanımla
          </button>
          <button onClick={() => setActiveTab('INFO')} className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-colors ${activeTab === 'INFO' ? 'border-b-2 border-slate-600 text-slate-600' : 'text-slate-400 hover:text-slate-700'}`}>
            ℹ️ Güvenlik Notu
          </button>
        </div>

        <div className="p-6">
          
          {activeTab === 'NEW_USER' && (
            <form onSubmit={handleAddUser} className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">👤 Yeni Sistem Hesabı</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Personel Adı Soyadı</label>
                <input name="name" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-purple-500" placeholder="Örn: Ayhan Öztürk" />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kullanıcı Adı (Giriş için)</label>
                  <input name="username" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-blue-600 outline-none focus:border-purple-500 bg-blue-50" placeholder="ayhan.ozturk" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Şifre</label>
                  <input name="password" type="password" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none focus:border-purple-500" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">İletişim (Telefon)</label>
                <input name="phone" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-sm text-slate-900 outline-none focus:border-purple-500" placeholder="053X XXX XX XX" />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest border-t border-slate-200 pt-4">Atanacak Yetki / Departman</label>
                <select name="role" required className="w-full px-3 py-3 border-2 border-slate-200 rounded-lg font-black text-sm text-slate-900 outline-none focus:border-purple-500 bg-slate-50 shadow-sm">
                  <option value="COORDINATOR">🌟 SÜPER KULLANICI (Genel Müdür)</option>
                  <option value="FINANCE">💵 FİNANS VE MUHASEBE UZMANI</option>
                  <option value="HR">👥 İNSAN KAYNAKLARI (Bordro)</option>
                  <option value="SALES">💼 SATIŞ VE MÜŞTERİ TEMSİLCİSİ</option>
                  <option value="PURCHASING">🛒 SATINALMA SORUMLUSU</option>
                  <option value="WAREHOUSE_MANAGER">🏭 DEPO VE LOJİSTİK MÜDÜRÜ</option>
                  <option value="WAREHOUSE_RECEIVING">📥 MAL KABUL SORUMLUSU (Sadece Giriş)</option>
                  <option value="WAREHOUSE_STAFF">📤 SİPARİŞ TOPLAYICI (Sadece Çıkış/Sevk)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-black tracking-wide py-3 rounded-lg hover:bg-purple-600 transition-all shadow-md mt-4">
                Sistem Hesabını Aç
              </button>
            </form>
          )}

          {activeTab === 'INFO' && (
            <div className="space-y-4 text-slate-600 font-medium text-xs leading-relaxed">
              <h4 className="font-black text-slate-800 text-sm mb-1">Erişim Yönetimi & RBAC</h4>
              <p>
                Bu ekranda oluşturulan hesaplar, sisteme atadığınız rollere göre kısıtlanmış bir arayüzle karşılaşırlar.
              </p>
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-700 font-bold mb-1">🚨 Kritik Uyarı</p>
                <p className="text-red-600">ADMIN hesabı asla silinemez veya yetkisi düşürülemez. Kullanıcıların Google Authenticator (2FA) doğrulamasını kendi cihazlarından aktif etmelerini zorunlu kılın.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}