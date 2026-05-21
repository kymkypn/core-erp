'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { VehicleStatus } from '@prisma/client'

// 1. TÜM ARAÇLARI VE MASRAF GEÇMİŞLERİNİ GETİR
export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        expenses: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, vehicles }
  } catch (error) {
    return { success: false, error: "Araç listesi yüklenemedi." }
  }
}

// 2. YENİ ARAÇ (FİLOYA) EKLE
export async function createVehicle(formData: FormData) {
  try {
    const plate = formData.get('plate') as string
    const brandModel = formData.get('brandModel') as string
    const type = formData.get('type') as string
    const currentDriver = formData.get('currentDriver') as string || null

    // Plaka benzersiz olmalı
    const existing = await prisma.vehicle.findUnique({ where: { plate } })
    if (existing) return { success: false, error: "Bu plaka zaten sisteme kayıtlı!" }

    await prisma.vehicle.create({
      data: { plate, brandModel, type, currentDriver }
    })

    revalidatePath('/dashboard/fleet')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Araç eklenirken bir hata oluştu." }
  }
}

// 3. ARAÇ DURUMUNU GÜNCELLE (Örn: Bakıma Alındı)
export async function updateVehicleStatus(vehicleId: string, status: VehicleStatus) {
  try {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status }
    })

    revalidatePath('/dashboard/fleet')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Araç durumu güncellenemedi." }
  }
}

// 4. ARACA MASRAF EKLE VE KASADAN DÜŞ (FİNANS ENTEGRASYONU)
export async function createVehicleExpense(formData: FormData) {
  try {
    const vehicleId = formData.get('vehicleId') as string
    const type = formData.get('type') as string
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string || ''
    const accountId = formData.get('accountId') as string // Hangi kasadan ödendi?

    if (amount <= 0) return { success: false, error: "Masraf tutarı 0'dan büyük olmalıdır." }
    if (!accountId) return { success: false, error: "Ödemenin yapılacağı kasayı seçmelisiniz." }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle) return { success: false, error: "Araç bulunamadı." }

    // Çift taraflı muhasebe (Masraf yaz ve Kasadan düş)
    await prisma.$transaction(async (tx) => {
      
      // 1. Filo Masraf Kaydını Oluştur
      await tx.vehicleExpense.create({
        data: { vehicleId, type, amount, description, date: new Date() }
      })

      // 2. Finans (Kasa) Hareketini Gider Olarak Yaz
      await tx.financialTransaction.create({
        data: {
          accountId,
          type: 'EXPENSE',
          amount,
          description: `Araç Gideri (${vehicle.plate}) - ${type}: ${description}`
        }
      })

      // 3. Seçilen Kasanın Bakiyesini Düşür
      await tx.cashAccount.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } }
      })
    })

    revalidatePath('/dashboard/fleet')
    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: "Masraf eklenirken bir hata oluştu." }
  }
}