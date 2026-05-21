'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

// 1. TÜM GÜVENLİK VE SİSTEM LOGLARINI GETİR
export async function getSecurityLogs() {
  try {
    const logs = await prisma.securityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Performans için son 100 kritik hareketi getiriyoruz
    })
    return { success: true, logs }
  } catch (error) {
    return { success: false, error: "Güvenlik günlükleri yüklenemedi." }
  }
}

// 2. LOG SİSTEMİNİ TETİKLEYECEK OTOMATİK FONKSİYON (SİSTEM İÇİ KULLANIM İÇİN)
// Bu fonksiyonu yarın bir gün diğer action'larda bir şey silindiğinde arka planda çağıracağız.
export async function logSecurityEvent(action: string, module: string, details: string) {
  try {
    await prisma.securityLog.create({
      data: { action, module, details }
    })
    revalidatePath('/dashboard/logs')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Log kaydı yazılamadı." }
  }
}

// 3. SİMÜLASYON İÇİN LOG TEMİZLEME/YENİLEME (Sadece Demo Ekranı için)
export async function generateDemoLogs() {
  try {
    const demoLogs = [
      { action: 'KULLANICI_GIRIS', module: 'AUTH', details: 'ayhan_ozturk isimli kullanıcı başarılı giriş yaptı. IP: 192.168.1.45' },
      { action: 'KASA_BAKİYE_GUNCELLE', module: 'FINANCE', details: 'Merkez Kasa bakiyesi 250.000 TL artırıldı.' },
      { action: 'PERSONEL_MAAS_DEGISIM', module: 'HR', details: 'Mustafa Kaptan isimli personelin taban maaşı güncellendi.' },
      { action: 'FATURA_SILINDI', module: 'INVOICE', details: 'GIB2026000000854 numaralı e-Fatura sistemden iptal edildi!' },
      { action: 'API_BAGLANTI_BAŞARILI', module: 'ECOMMERCE', details: 'Trendyol API entegrasyonu başarılı bir şekilde senkronize oldu.' }
    ]

    for (const log of demoLogs) {
      await prisma.securityLog.create({ data: log })
    }

    revalidatePath('/dashboard/logs')
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}