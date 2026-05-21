'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Tüm Reçeteleri Getir
export async function getRecipes() {
  return await prisma.recipe.findMany({
    include: {
      targetProduct: true,
      ingredients: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// 2. Yeni Reçete Oluştur
export async function createRecipe(mainProductId: string, targetQuantity: number, ingredients: { ingredientId: string, quantity: number }[]) {
  try {
    // Bu ürünün zaten bir reçetesi var mı kontrol et
    const existing = await prisma.recipe.findUnique({ where: { targetProductId: mainProductId } })
    if (existing) return { success: false, error: "Bu ürünün zaten bir reçetesi var!" }

    await prisma.recipe.create({
      data: {
        targetProductId: mainProductId,
        targetQuantity,
        ingredients: {
          create: ingredients.map(item => ({ productId: item.ingredientId, quantity: item.quantity }))
        }
      }
    })
    revalidatePath('/dashboard/recipes')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Reçete kaydedilemedi." }
  }
}

// 3. ÜRETİMİ BAŞLAT (Stokları otomatik dönüştürür)
export async function produceItem(recipeId: string, productionMultiplier: number) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { ingredients: true }
    })

    if (!recipe) return { success: false, error: "Reçete bulunamadı." }

    // İşlemleri bir "Transaction" (Toplu İşlem) içine alıyoruz. 
    // Biri hata verirse hiçbiri çalışmaz, böylece stoklar bozulmaz.
    await prisma.$transaction(async (tx) => {
      // 1. Hammaddeleri stoktan düş
      for (const item of recipe.ingredients) {
        const totalNeeded = item.quantity * productionMultiplier
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: totalNeeded } } // Stok azalt
        })
      }

      // 2. Ana (Mamul) ürünü stoğa ekle
      const totalProduced = recipe.targetQuantity * productionMultiplier
      await tx.product.update({
        where: { id: recipe.targetProductId },
        data: { stock: { increment: totalProduced } } // Stok artır
      })
    })

    revalidatePath('/dashboard/recipes')
    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Üretim sırasında hata oluştu. Hammadde stoğunuz yetersiz olabilir." }
  }
}