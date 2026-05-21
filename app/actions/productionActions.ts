'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

// 1. REÇETELERİ VE İÇERİKLERİNİ GETİR
export async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        targetProduct: true,
        ingredients: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, recipes }
  } catch (error) {
    return { success: false, error: "Reçeteler yüklenemedi." }
  }
}

// 2. YENİ REÇETE OLUŞTUR (ÇOKLU HAMMADDE İLE)
export async function createRecipe(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const targetProductId = formData.get('targetProductId') as string
    
    // Arayüzden JSON string olarak gelecek hammaddeler listesini çözümlüyoruz
    const ingredientsJson = formData.get('ingredients') as string
    const ingredients = JSON.parse(ingredientsJson) // Örn: [{productId: "123", quantity: 5}]

    if (!ingredients || ingredients.length === 0) {
      return { success: false, error: "Reçetede en az 1 hammadde bulunmalıdır." }
    }

    // Bir ürünün sadece bir reçetesi olabilir kontrolü
    const existing = await prisma.recipe.findUnique({ where: { targetProductId } })
    if (existing) return { success: false, error: "Bu nihai ürün için zaten bir reçete mevcut!" }

    await prisma.recipe.create({
      data: {
        name,
        targetProductId,
        targetQuantity: 1,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            productId: ing.productId,
            quantity: parseFloat(ing.quantity)
          }))
        }
      }
    })

    revalidatePath('/dashboard/recipes')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Reçete sisteme kaydedilemedi." }
  }
}

// 3. TÜM ÜRETİM EMİRLERİNİ GETİR
export async function getProductionOrders() {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: {
        recipe: {
          include: { targetProduct: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, orders }
  } catch (error) {
    return { success: false, error: "Üretim emirleri yüklenemedi." }
  }
}

// 4. YENİ ÜRETİM EMRİ VER (PLANLA)
export async function createProductionOrder(formData: FormData) {
  try {
    const recipeId = formData.get('recipeId') as string
    const quantity = parseFloat(formData.get('quantity') as string)

    if (quantity <= 0) return { success: false, error: "Üretim miktarı 0'dan büyük olmalıdır." }

    await prisma.productionOrder.create({
      data: {
        recipeId,
        quantity,
        status: 'PLANNED',
        startDate: new Date()
      }
    })

    revalidatePath('/dashboard/recipes')
    return { success: true }
  } catch (error) {
    return { success: false, error: "İş emri oluşturulamadı." }
  }
}

// 5. ÜRETİMİ TAMAMLA VE STOKLARI OTOMATİK DÜŞ/EKLE (ERP'NİN KALBİ)
export async function completeProductionOrder(orderId: string) {
  try {
    // Üretim emrini, reçetesini ve içindeki hammaddeleri bul
    const order = await prisma.productionOrder.findUnique({
      where: { id: orderId },
      include: {
        recipe: {
          include: { ingredients: true }
        }
      }
    })

    if (!order) return { success: false, error: "Emir bulunamadı." }
    if (order.status === 'COMPLETED') return { success: false, error: "Bu üretim çoktan tamamlanmış ve stoklara işlenmiş." }

    // Çift taraflı stok güncellemesi (Veritabanı Transaction ile korunur, hata olursa hiçbir şey silinmez)
    await prisma.$transaction(async (tx) => {
      
      // A) Üretim emrinin durumunu "Tamamlandı" yap
      await tx.productionOrder.update({
        where: { id: orderId },
        data: { status: 'COMPLETED', endDate: new Date() }
      })

      // B) Üretim için gereken HAMMADDELERİ stoktan eksilt
      for (const ingredient of order.recipe.ingredients) {
        const totalNeeded = ingredient.quantity * order.quantity // Örn: 1 masa için 4 ayak, 50 masa siparişiyse 200 ayak lazım
        
        await tx.product.update({
          where: { id: ingredient.productId },
          data: { stock: { decrement: totalNeeded } }
        })

        // Stok hareketlerine (Loglara) "Üretimde Kullanıldı" diye işle
        await tx.stockMovement.create({
          data: {
            productId: ingredient.productId,
            type: 'WASTE', 
            quantity: -totalNeeded,
            description: `Üretim Tüketimi (İş Emri: ${order.id})`
          }
        })
      }

      // C) Üretilen NİHAİ MAMULÜ stoğa ekle
      await tx.product.update({
        where: { id: order.recipe.targetProductId },
        data: { stock: { increment: order.quantity } }
      })

      // Stok hareketlerine "Üretimden Çıktı" diye işle
      await tx.stockMovement.create({
        data: {
          productId: order.recipe.targetProductId,
          type: 'ADJUSTMENT', 
          quantity: order.quantity,
          description: `Üretim Bandından Stoğa Giriş (İş Emri: ${order.id})`
        }
      })
    })

    revalidatePath('/dashboard/recipes')
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Üretim tamamlanırken hata oluştu. Hammadde stokları yetersiz olabilir." }
  }
}