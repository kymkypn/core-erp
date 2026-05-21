'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// EXCEL'DEN GELEN JSON VERİSİNİ VERİTABANINA TOPLU YAZMA (UPSERT MANTIĞI)
export async function processExcelData(productsData: any[]) {
  try {
    let successCount = 0
    let updateCount = 0
    let errorCount = 0

    // Prisma'da transaction kullanarak toplu işlemi güvenli hale getiriyoruz
    await prisma.$transaction(async (tx) => {
      for (const row of productsData) {
        // Excel kolon başlıklarını güvenli şekilde okuyoruz
        const sku = row['Ürün Kodu (SKU / Barkod)']
        const name = row['Ürün Adı']
        const stock = parseInt(row['Mevcut Stok']) || 0
        
        // KDV, Alış ve Satış fiyatları bizde opsiyonel/genişletilebilir alanlardı, 
        // Burada isim üzerinden kontrol (SKU mantığı) ile eşleşme yapıyoruz.
        
        if (!name) {
          errorCount++
          continue
        }

        // Ürün adıyla sistemde ürün var mı kontrol et (Eğer veritabanımızda barkod/SKU alanı olsaydı ona göre arardık)
        const existingProduct = await tx.product.findFirst({
          where: { name: name }
        })

        if (existingProduct) {
          // ÜRÜN VARSA -> STOK GÜNCELLE
          await tx.product.update({
            where: { id: existingProduct.id },
            data: { 
              stock: existingProduct.stock + stock // Mevcut stoğun üzerine Excel'deki stoğu ekliyoruz
            }
          })
          updateCount++
        } else {
          // ÜRÜN YOKSA -> SIFIRDAN YENİ ÜRÜN OLUŞTUR
          await tx.product.create({
            data: {
              name: name,
              sku: sku || name,
              stock: stock,
            }
          })
          successCount++
        }
      }
    })

    // Ürünler sayfasını yenile
    revalidatePath('/dashboard/products')
    
    return { 
      success: true, 
      message: `${successCount} yeni ürün eklendi, ${updateCount} ürün güncellendi.` 
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Excel verileri veritabanına işlenirken kritik bir hata oluştu." }
  }
}