'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Kasaları Getir
export async function getAccounts() {
  return await prisma.cashAccount.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

// 2. Yeni Kasa/Banka Ekle
export async function createAccount(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const type = formData.get('type') as 'CASH' | 'BANK'
    const balance = parseFloat(formData.get('balance') as string) || 0

    await prisma.cashAccount.create({ data: { name, type, balance } })
    revalidatePath('/dashboard/finance')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Kasa açılamadı." }
  }
}

// 3. Makbuz/Dekont (Para Hareketi) İşle
export async function createTransaction(formData: FormData) {
  try {
    const accountId = formData.get('accountId') as string
    const companyId = formData.get('companyId') as string || null
    const type = formData.get('type') as 'COLLECTION' | 'PAYMENT' | 'EXPENSE' | 'INCOME'
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string

    if (amount <= 0) return { success: false, error: "Tutar 0'dan büyük olmalıdır." }

    await prisma.$transaction(async (tx) => {
      // 1. Hareketi (Makbuzu) Kaydet
      await tx.financialTransaction.create({
        data: { accountId, companyId, type, amount, description }
      })

      // 2. Kasa/Banka Bakiyesini Güncelle
      const accountChange = (type === 'COLLECTION' || type === 'INCOME') ? amount : -amount
      await tx.cashAccount.update({
        where: { id: accountId },
        data: { balance: { increment: accountChange } }
      })

      // 3. Eğer Tahsilat veya Ödeme ise, Cari Hesabı (Firmayı) Güncelle
      if (companyId && (type === 'COLLECTION' || type === 'PAYMENT')) {
        // Satış yaptığımızda (+) oluyordu. Tahsilat yaparsak borcu düşer (-).
        // Mal aldığımızda (-) oluyordu. Ödeme yaparsak borcumuz düşer (+).
        const companyChange = type === 'COLLECTION' ? -amount : amount
        await tx.company.update({
          where: { id: companyId },
          data: { balance: { increment: companyChange } }
        })
      }
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/companies')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: "İşlem kaydedilemedi." }
  }
}

// 4. Son İşlemleri Getir
export async function getTransactions() {
  return await prisma.financialTransaction.findMany({
    include: { account: true, company: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}