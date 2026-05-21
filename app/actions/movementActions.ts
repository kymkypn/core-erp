'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export async function getMovements() {
  return await prisma.stockMovement.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createMovement(formData: FormData) {
  try {
    const productId = formData.get('productId') as string
    const type = formData.get('type') as 'WASTE' | 'RETURN' | 'ADJUSTMENT'
    const quantity = parseInt(formData.get('quantity') as string)
    const description = formData.get('description') as string

    if (quantity <= 0) return { success: false, error: "Miktar 0'dan büyük olmalıdır." }

    await prisma.$transaction(async (tx) => {
      // 1. Hareketi Log Olarak Kaydet
      await tx.stockMovement.create({
        data: { productId, type, quantity, description }
      })

      // 2. Fiziksel Stoğu Güncelle
      // Fire ise stok azalır (-), İade ise stok artar (+)
      const stockChange = type === 'WASTE' ? -quantity : quantity

      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: stockChange } }
      })
    })

    revalidatePath('/dashboard/movements')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: "İşlem kaydedilemedi." }
  }
}