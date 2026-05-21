'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { MarketplaceName } from '@prisma/client'

// 1. TÜM ENTEGRASYON KARTLARINI SİPARİŞ SAYILARIYLA BİRLİKTE GETİR
export async function getIntegrations() {
  try {
    const integrations = await prisma.marketplaceIntegration.findMany({
      include: {
        _count: {
          select: { externalOrders: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return { success: true, integrations }
  } catch (error) {
    return { success: false, error: "Entegrasyonlar yüklenemedi." }
  }
}

// 2. YENİ PAZARYERİ MAĞAZASI BAĞLA (API KARTINI AÇ)
export async function createIntegration(formData: FormData) {
  try {
    const name = formData.get('name') as MarketplaceName
    const storeName = formData.get('storeName') as string
    const apiKey = formData.get('apiKey') as string
    const apiSecret = formData.get('apiSecret') as string || null

    await prisma.marketplaceIntegration.create({
      data: { name, storeName, apiKey, apiSecret }
    })

    revalidatePath('/dashboard/ecommerce')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Mağaza entegrasyonu oluşturulamadı." }
  }
}

// 3. API SENKRONİZASYON SİMÜLASYONU (TRENDYOL / AMAZON'DAN SİPARİŞ ÇEKME ŞOVU)
export async function syncMarketplaceOrders(integrationId: string) {
  try {
    const integration = await prisma.marketplaceIntegration.findUnique({
      where: { id: integrationId }
    })

    if (!integration) return { success: false, error: "Entegrasyon bulunamadı." }

    // Simüle sipariş havuzu verileri
    const names = ['Ahmet Yılmaz', 'Mehmet Kaya', 'Canan Demir', 'Tülay Kaymakyapan', 'Ayhan Öztürk', 'Burak Yılmaz']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomAmount = Math.floor(Math.random() * 4500) + 150
    const randomOrderNo = `${integration.name.substring(0, 2)}-${Math.floor(Math.random() * 900000) + 100000}`

    // Arka planda yeni bir dış sipariş üretiyoruz (Sanki API'den gelmiş gibi)
    await prisma.$transaction(async (tx) => {
      await tx.externalOrder.create({
        data: {
          integrationId,
          marketplaceOrderId: randomOrderNo,
          customerName: randomName,
          totalAmount: randomAmount,
          status: 'Yeni Sipariş'
        }
      })

      // Son senkronizasyon tarihini şu anki tarih olan 17.05.2026 olarak güncelle
      await tx.marketplaceIntegration.update({
        where: { id: integrationId },
        data: { lastSync: new Date('2026-05-17T23:13:35') }
      })
    })

    revalidatePath('/dashboard/ecommerce')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Senkronizasyon başarısız oldu." }
  }
}

// 4. PAZARYERLERİNDEN GELEN TÜM SİPARİŞLERİ LİSTELE
export async function getExternalOrders() {
  try {
    const orders = await prisma.externalOrder.findMany({
      include: {
        integration: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, orders }
  } catch (error) {
    return { success: false, error: "Dış siparişler yüklenemedi." }
  }
}