'use client'

import { useState, useEffect } from 'react'
import { getOrders, createOrder, completeOrder } from '@/app/actions/orderActions'
import { getProducts } from '@/app/actions/productActions'
import { getCompanies } from '@/app/actions/companyActions'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [ordRes, prodRes, compRes] = await Promise.all([getOrders(), getProducts(), getCompanies()])
    setOrders(ordRes)
    if (prodRes.success) setProducts(prodRes.products || [])
    if (compRes.success) setCompanies(compRes.companies || [])
    setLoading(false)
  }

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const type = formData.get('type') as 'PURCHASE' | 'SALE'
    const productId = formData.get('productId') as string
    const companyId = formData.get('companyId') as string
    const qty = parseInt(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)

    const res = await createOrder(type, productId, qty, price, companyId)
    if (res.success) {
      loadData()
      e.currentTarget.reset()
    }
  }

  const handleCompleteOrder = async (orderId: string, orderedQty: number) => {
    const userInput = prompt(`Sipariş Miktarı: ${orderedQty} Adet.\n\nGerçekte TESLİM ALINAN/SEVK EDİLEN miktarı giriniz:`, orderedQty.toString())
    if (userInput === null) return
    
    const actualQty = parseInt(userInput)
    if (isNaN(actualQty) || actualQty < 0) {
      alert("Geçerli bir sayı giriniz!"); return;
    }

    const res = await completeOrder(orderId, actualQty)
    if (res.success) loadData()
  }

  return (
    <div className="space-y-8">
      {/* SİPARİŞ OLUŞTURMA FORMU */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
           <span className="bg-blue-600 w-2 h-6 rounded-full inline-block"></span>
           Yeni İşlem Fişi
        </h3>
        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">İşlem</label>
            <select name="type" className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 bg-slate-50 outline-none">
              <option value="PURCHASE">Mal Alımı</option>
              <option value="SALE">Mal Satışı</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Cari / Firma</label>
            <select name="companyId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none">
              <option value="">-- Firma Seçiniz --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Ürün</label>
            <select name="productId" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none">
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Miktar</label>
            <input name="quantity" type="number" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Fiyat (₺)</label>
            <input name="price" type="number" step="0.01" required className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="0.00" />
          </div>
          <div className="md:col-span-6 flex justify-end mt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all">
              Siparişi Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* SİPARİŞ LİSTESİ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4">
          <h3 className="text-white font-bold">İşlem Listesi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4">Tarih</th>
                <th className="p-4">Tip</th>
                <th className="p-4">Cari / Firma</th>
                <th className="p-4">Ürün</th>
                <th className="p-4 text-center">Miktar</th>
                <th className="p-4">Tutar</th>
                <th className="p-4 text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const item = order.items[0];
                if (!item) return null;
                return (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 text-sm font-medium">
                    <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${order.type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.type === 'PURCHASE' ? 'ALIM' : 'SATIŞ'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-blue-700">{order.company?.name || 'Bilinmiyor'}</td>
                    <td className="p-4 font-bold text-slate-800">{item.product.name}</td>
                    <td className="p-4 text-center text-slate-900 font-extrabold">{item.quantity}</td>
                    <td className="p-4 font-bold">₺{order.totalAmount}</td>
                    <td className="p-4 text-center">
                      {order.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleCompleteOrder(order.id, item.quantity)}
                          className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 shadow-sm"
                        >
                          Onayla (Stoka/Cariye İşle)
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold">✅ İşlendi</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}