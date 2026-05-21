'use server' // Bu dosya server-side olduğu için bunu mutlaka en üste ekle

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'

// Dosya içinde prisma nesnesi tanımlı değilse, buradan oluştur:
const prisma = new PrismaClient()

// Eğer TicketStatus için tip hatası alıyorsan, onu import etme, tipini doğrudan buraya yaz:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

// ... (kodların devamı)

// ==========================================
// 1. SESSİZ MAİL GÖNDERME BOTU (ARKA PLAN)
// ==========================================
async function sendSilentAlert(subject: string, message: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,     // .env dosyasından çekilir
        pass: process.env.SMTP_PASSWORD   // .env dosyasından çekilir
      }
    })

    await transporter.sendMail({
      from: `"ERP Güvenlik Botu" <${process.env.SMTP_EMAIL}>`,
      to: process.env.ADMIN_EMAIL, // Uyarılar kendi mailine gelsin (veya buraya direkt mailini yazabilirsin)
      subject: `🚨 ${subject}`,
      text: message
    })
  } catch (error) {
    // Mail gönderiminde hata olursa sistemi durdurma, sadece konsola yaz (kullanıcı fark etmez)
    console.error("Gizli mail gönderim hatası:", error)
  }
}

// ==========================================
// 2. TÜM SİSTEM İŞLEMLERİNİ (LOGLARI) GETİR
// ==========================================
export async function getAuditLogs() {
  // Sadece include değil, tüm alanları kapsayacak şekilde genişletiyoruz
const finances = await prisma.financialTransaction.findMany({ 
  include: { account: true, company: true }, 
  take: 40, 
  orderBy: { createdAt: 'desc' } 
})

const orders = await prisma.order.findMany({ 
  include: { company: true, items: { include: { product: true } } }, 
  take: 40, 
  orderBy: { createdAt: 'desc' } 
})

const movements = await prisma.stockMovement.findMany({ 
  include: { product: true }, 
  take: 40, 
  orderBy: { createdAt: 'desc' } 
})

  let logs: any[] = []

  // Finans Logları
  finances.forEach(f => logs.push({
    id: f.id, module: 'FINANCE', date: f.createdAt,
    title: f.type === 'COLLECTION' ? 'Tahsilat' : f.type === 'PAYMENT' ? 'Ödeme' : 'Kasa İşlemi',
    desc: `${f.account.name} | ${f.company?.name || 'Cari Yok'} | ${f.description || ''}`,
    value: `₺${f.amount.toLocaleString()}`, color: 'bg-emerald-100 text-emerald-700'
  }))

  // Sipariş / Sevkiyat Logları
  orders.forEach(o => {
    const item = o.items[0]
    logs.push({
      id: o.id, module: 'ORDER', date: o.createdAt,
      title: o.type === 'PURCHASE' ? 'Mal Alımı' : 'Satış Sevkiyatı',
      desc: `${o.company?.name || 'Cari Yok'} | ${item?.product?.name || 'Ürün Yok'}`,
      value: `${item?.quantity || 0} Adet | ₺${o.totalAmount.toLocaleString()}`, 
      color: o.type === 'PURCHASE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700',
      status: o.status
    })
  })

  // Fire / İade Logları
  movements.forEach(m => logs.push({
    id: m.id, module: 'MOVEMENT', date: m.createdAt,
    title: m.type === 'WASTE' ? 'Fire Çıkışı' : m.type === 'RETURN' ? 'Müşteri İadesi' : 'Sayım Düzeltme',
    desc: `${m.product.name} | ${m.description || ''}`,
    value: `${m.quantity} Adet`, color: 'bg-orange-100 text-orange-700'
  }))

  // Tüm listeyi tarihe göre (yeniden eskiye) sırala ve son 100 işlemi döndür
  logs.sort((a, b) => b.date.getTime() - a.date.getTime())
  return logs.slice(0, 100)
}

// ==========================================
// 3. İŞLEMİ SİL, HESAPLARI GERİ AL VE SESSİZCE RAPORLA
// ==========================================
export async function deleteRecord(module: string, id: string) {
  try {
    let deletedInfo = ""

    await prisma.$transaction(async (tx) => {
      
      // A) FİNANS İŞLEMİ SİLİNİYORSA
      if (module === 'FINANCE') {
        const record = await tx.financialTransaction.findUnique({ where: { id }, include: { account: true, company: true }})
        if (!record) throw new Error("İşlem bulunamadı")
        
        deletedInfo = `${record.account.name} kasasından, ${record.company?.name || 'Cari Bağımsız'} firmasına ait ₺${record.amount} tutarındaki ${record.type} işlemi silindi.`

        // Kasayı Geri Al
        const accChange = (record.type === 'COLLECTION' || record.type === 'INCOME') ? -record.amount : record.amount
        await tx.cashAccount.update({ where: { id: record.accountId }, data: { balance: { increment: accChange }}})

        // Cari Bakiyeyi Geri Al
        if (record.companyId && (record.type === 'COLLECTION' || record.type === 'PAYMENT')) {
          const compChange = record.type === 'COLLECTION' ? record.amount : -record.amount
          await tx.company.update({ where: { id: record.companyId }, data: { balance: { increment: compChange }}})
        }
        await tx.financialTransaction.delete({ where: { id }})
      }

      // B) SİPARİŞ / SEVKİYAT İŞLEMİ SİLİNİYORSA
      else if (module === 'ORDER') {
        const order = await tx.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, company: true }})
        if (!order) throw new Error("Sipariş bulunamadı")
        
        deletedInfo = `${order.company?.name || 'Bilinmeyen Firma'} firmasından ₺${order.totalAmount} değerindeki ${order.type === 'PURCHASE' ? 'Alım' : 'Satış'} siparişi silindi.`

        // Sipariş işlendiyse stok ve cariyi geri al
        if (order.status === 'COMPLETED') {
          const item = order.items[0]
          if (item) {
            const stockChange = order.type === 'PURCHASE' ? -item.quantity : item.quantity
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: stockChange }}})
          }
          if (order.companyId) {
            const balChange = order.type === 'SALE' ? -order.totalAmount : order.totalAmount
            await tx.company.update({ where: { id: order.companyId }, data: { balance: { increment: balChange }}})
          }
        }
        await tx.order.delete({ where: { id }})
      }

      // C) FİRE / İADE İŞLEMİ SİLİNİYORSA
      else if (module === 'MOVEMENT') {
        const mov = await tx.stockMovement.findUnique({ where: { id }, include: { product: true }})
        if (!mov) throw new Error("Kayıt bulunamadı")
        
        deletedInfo = `${mov.product.name} ürününe ait ${mov.quantity} adetlik ${mov.type} işlemi silindi.`

        // Stoğu geri al
        const stockChange = mov.type === 'WASTE' ? mov.quantity : -mov.quantity
        await tx.product.update({ where: { id: mov.productId }, data: { stock: { increment: stockChange }}})
        await tx.stockMovement.delete({ where: { id }})
      }

      // 4. VERİTABANINA GİZLİ (GÖLGE) LOG YAZ
      await tx.securityLog.create({
        data: {
          action: "KAYIT_IPTALI",
          module: module,
          details: deletedInfo
        }
      })
    })

    // 5. PATRONA SESSİZCE MAİL AT (await kullanmıyoruz, arka planda asenkron gitsin ki sistem beklemesin)
    sendSilentAlert("Kritik İşlem İptali (Sistem Uyarı)", `Sistemde bir işlem geri alındı ve veritabanından silindi.\n\nDetaylar:\n- İşlem: ${deletedInfo}\n- Tarih: ${new Date().toLocaleString('tr-TR')}`)

    // Tüm sayfaların güncel verilerini tazele
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/admin-logs')
    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard/companies')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "İşlem silinemedi." }
  }
}