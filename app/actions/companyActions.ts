'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Tüm Firmaları Getir
export async function getCompanies() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    })
    return { success: true, companies }
  } catch (error) {
    return { success: false, error: "Firmalar getirilemedi." }
  }
}

// 2. Yeni Firma Ekle
export async function createCompany(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const type = formData.get('type') as "CUSTOMER" | "SUPPLIER" | "BOTH"
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string

    await prisma.company.create({
      data: { name, type, phone, email, address }
    })

    revalidatePath('/dashboard/companies')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Firma eklenirken bir hata oluştu." }
  }
}