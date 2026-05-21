'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. BARKOD OKUTULDUĞUNDA ÜRÜNÜ BUL
export async function scanBarcode(barcode: string) {
  try {
    // Gerçek bir sistemde barkod/SKU alanı aranır. Bizim modelimizde ürün adı veya ID'sinde arıyoruz.
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: barcode },
          { name: { contains: barcode, mode: 'insensitive' } } // Barkod metni ürün adında geçiyorsa
        ]
      }
    })

    if (!product) {
      return { success: false, error: "Barkod veya ürün sistemde bulunamadı!" }
    }

    return { success: true, product }
  } catch (error) {
    return { success: false, error: "Okuma sırasında veritabanı hatası oluştu." }
  }
}

// 2. TERMİNAL ÜZERİNDEN HIZLI STOK GİRİŞ/ÇIKIŞI YAP
export async function quickStockUpdate(productId: string, quantity: number, type: 'IN' | 'OUT') {
  try {
    if (quantity <= 0) return { success: false, error: "Miktar 0'dan büyük olmalıdır." }

    const amount = type === 'IN' ? quantity : -quantity

    // Prisma Transaction ile hem stoğu güncelle hem de log at
    await prisma.$transaction(async (tx) => {
      // 1. Stoğu Güncelle
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: amount } }
      })

      // Negatif stoğa düşmeyi engelleme kontrolü (opsiyonel ama güvenli)
      if (updatedProduct.stock < 0) {
        throw new Error("Stok yetersiz! Negatif stoğa inilemez.")
      }

      // 2. Stok Hareketini (Log) Kaydet
      await tx.stockMovement.create({
        data: {
          productId,
          type: type === 'IN' ? 'ADJUSTMENT' : 'SALE',
          quantity: amount,
          description: `📱 El Terminali ile Hızlı ${type === 'IN' ? 'Kabul' : 'Çıkış'}`
        }
      })
    })

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Stok güncellenirken bir hata oluştu." }
  }
}