'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

// 1. Siparişleri Getir (Artık Firma bilgisini de getiriyor)
export async function getOrders() {
  return await prisma.order.findMany({
    include: { 
      items: { include: { product: true } },
      company: true // FİRMA BAĞLANTISI
    },
    orderBy: { createdAt: 'desc' }
  })
}

// 2. Yeni Sipariş Oluştur (Artık companyId alıyor)
export async function createOrder(type: 'PURCHASE' | 'SALE', productId: string, quantity: number, price: number, companyId: string) {
  try {
    await prisma.order.create({
      data: {
        type,
        status: 'PENDING',
        totalAmount: quantity * price,
        companyId: companyId, // HANGİ FİRMA?
        items: {
          create: { productId, quantity, price }
        }
      }
    })
    revalidatePath('/dashboard/orders')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Sipariş oluşturulamadı." }
  }
}

// 3. Mal Kabul / Sevkiyat Onayı (Stok ve CARİ BAKİYE güncellenir)
export async function completeOrder(orderId: string, actualQuantity: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order || order.status === 'COMPLETED') return { success: false }

    const item = order.items[0]
    if (!item) return { success: false }

    const stockChange = order.type === 'PURCHASE' ? actualQuantity : -actualQuantity
    const newTotalAmount = actualQuantity * item.price

    // 1. Stok Güncelle
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: stockChange } }
    })

    // 2. Sipariş Kalemini Güncelle
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: actualQuantity }
    })

    // 3. Siparişi Tamamla
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', totalAmount: newTotalAmount }
    })

    // 4. CARİ BAKİYE GÜNCELLEMESİ (Ön Muhasebe)
    // Satış ise Müşteri bize borçlanır (+), Alım ise biz Tedarikçiye borçlanırız (-)
    if (order.companyId) {
      const balanceChange = order.type === 'SALE' ? newTotalAmount : -newTotalAmount
      await prisma.company.update({
        where: { id: order.companyId },
        data: { balance: { increment: balanceChange } }
      })
    }

    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard/companies')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}