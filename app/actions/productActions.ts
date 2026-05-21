'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, products }
  } catch (error) {
    return { success: false, error: "Ürünler getirilemedi." }
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const sku = formData.get('sku') as string

    // Aynı barkoddan var mı kontrolü
    const existingProduct = await prisma.product.findUnique({ where: { sku } })
    if (existingProduct) {
      return { success: false, error: "Bu barkod zaten kayıtlı!" }
    }

    // YENİ HALİ: Sadece isim, barkod ve başlangıç stoğunu (0) gönderiyoruz. Fiyatlar yok!
    await prisma.product.create({
      data: { 
        name, 
        sku, 
        stock: 0 
      } 
    })

    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ürün eklenemedi." }
  }
}