'use client'

import { useState, useRef, useEffect } from 'react'
import { scanBarcode, quickStockUpdate } from '@/app/actions/terminalActions'
import { GetUserSession } from '@/app/actions/authActions'

export default function TerminalPage() {
  const [userRole, setUserRole] = useState<string>('')
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Sayfa açıldığında hem input'a odaklan hem de kullanıcının rolünü öğren
  useEffect(() => {
    inputRef.current?.focus()
    async function fetchSession() {
      const session = await GetUserSession()
      if (session) setUserRole(session.role)
    }
    fetchSession()
  }, [])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode.trim()) return
    
    setLoading(true)
    setStatus({ type: 'idle', message: '' })
    
    const res = await scanBarcode(barcode)
    
    if (res.success) {
      setProduct(res.product)
      setQuantity(1)
      setStatus({ type: 'success', message: 'Ürün eşleşti.' })
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play() } catch(e) {}
    } else {
      setProduct(null)
      setStatus({ type: 'error', message: res.error || 'Bulunamadı' })
    }
    
    setLoading(false)
    setBarcode('')
    inputRef.current?.focus()
  }

  const handleAction = async (type: 'IN' | 'OUT') => {
    if (!product) return
    setLoading(true)
    
    const res = await quickStockUpdate(product.id, quantity, type)
    
    if (res.success) {
      setStatus({ 
        type: 'success', 
        message: `${quantity} adet ${type === 'IN' ? 'stoğa EKLENDİ.' : 'stoktan DÜŞÜLDÜ.'}` 
      })
      setTimeout(() => {
        setProduct(null)
        setBarcode('')
        setStatus({ type: 'idle', message: '' })
        inputRef.current?.focus()
      }, 2000)
    } else {
      setStatus({ type: 'error', message: res.error || 'İşlem başarısız.' })
    }
    setLoading(false)
  }

  // YETKİ KONTROL YARDIMCILARI
  const showInbound = ['ADMIN', 'COORDINATOR', 'WAREHOUSE_MANAGER', 'WAREHOUSE_RECEIVING'].includes(userRole)
  const showOutbound = ['ADMIN', 'COORDINATOR', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF'].includes(userRole)

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col pt-4 pb-8 px-4">
      
      {/* Üst Karşılama */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 text-center shadow-lg border border-slate-800 mb-6">
        <h2 className="text-xl font-black tracking-widest uppercase">📱 Depo Terminali</h2>
        <p className="text-xs font-bold text-slate-400 mt-1">
          {userRole === 'WAREHOUSE_RECEIVING' && '📥 MAL KABUL İSTASYONU'}
          {userRole === 'WAREHOUSE_STAFF' && '📤 SİPARİŞ TOPLAMA İSTASYONU'}
          {['ADMIN', 'COORDINATOR', 'WAREHOUSE_MANAGER'].includes(userRole) && '⚙️ TAM YETKİLİ PANEL'}
        </p>
      </div>

      {/* Barkod Okuyucu Input */}
      <form onSubmit={handleScan} className="mb-6 relative">
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barkod Okutun veya Yazın..."
          className="w-full text-center text-xl font-black text-slate-800 px-6 py-5 bg-white border-4 border-blue-500 rounded-3xl shadow-lg outline-none placeholder:text-slate-300 placeholder:font-bold focus:border-blue-600 transition-colors"
          autoComplete="off"
          disabled={loading}
        />
      </form>

      {status.message && (
        <div className={`p-4 rounded-2xl text-center font-black text-sm mb-6 shadow-sm border-2 ${status.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          {status.type === 'error' ? '❌ ' : '✅ '}{status.message}
        </div>
      )}

      {product && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-200 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4">
          
          <div className="text-center mb-6">
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Ürün Bulundu</span>
            <h3 className="text-2xl font-black text-slate-800 mt-3 line-clamp-2">{product.name}</h3>
            <p className="text-sm font-bold text-slate-500 mt-2">
              Mevcut Stok: <span className="text-blue-600 font-black text-lg">{product.stock}</span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Miktar</label>
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-16 h-16 bg-white rounded-2xl text-3xl font-black text-slate-700 shadow-sm border border-slate-200 active:scale-95 transition-transform">-</button>
              <span className="text-5xl font-black text-slate-800 w-20 text-center">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-16 h-16 bg-white rounded-2xl text-3xl font-black text-slate-700 shadow-sm border border-slate-200 active:scale-95 transition-transform">+</button>
            </div>
          </div>

          {/* ROL TABANLI DİNAMİK BUTONLAR */}
          <div className="grid grid-cols-1 gap-4 mt-auto">
            {showInbound && (
              <button 
                onClick={() => handleAction('IN')}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white p-6 rounded-3xl font-black text-lg shadow-lg flex flex-col items-center gap-2 transition-colors w-full"
              >
                <span className="text-3xl">📥</span> MAL KABULÜ YAP (RAFA AL)
              </button>
            )}
            
            {showOutbound && (
              <button 
                onClick={() => handleAction('OUT')}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white p-6 rounded-3xl font-black text-lg shadow-lg flex flex-col items-center gap-2 transition-colors w-full"
              >
                <span className="text-3xl">📤</span> SİPARİŞİ TOPLA (SEVK ET)
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  )
}