'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { InvoiceDirection, InvoiceScenario } from '@prisma/client'

// 1. TÜM FATURALARI GETÝR (Deðiþmedi, ayný kalýyor)
export async function getInvoices() {
  try {
    const invoices = await prisma.eInvoice.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const companyIds = invoices.map(i => i.companyId)
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } }
    })

    const invoicesWithCompany = invoices.map(invoice => ({
      ...invoice,
      company: companies.find(c => c.id === invoice.companyId) || { name: 'Bilinmeyen Cari Account' }
    }))

    return { success: true, invoices: invoicesWithCompany }
  } catch (error) {
    return { success: false, error: "Fatura listesi yüklenemedi." }
  }
}

// 2. YENÝ E-FATURA OLUÞTUR (DÝNAMÝK KDV SEÇÝMLÝ)
export async function createInvoice(formData: FormData) {
  try {
    const direction = formData.get('direction') as InvoiceDirection
    const scenario = formData.get('scenario') as InvoiceScenario
    const companyId = formData.get('companyId') as string
    const totalAmount = parseFloat(formData.get('totalAmount') as string) // Matrah
    
    // Kullanýcýnýn arayüzden seçtiði KDV oranýný alýyoruz (Örn: 20, 10, 1)
    const taxRate = parseFloat(formData.get('taxRate') as string) || 20 

    if (totalAmount <= 0) return { success: false, error: "Fatura tutarý 0'dan büyük olmalýdýr." }
    if (!companyId) return { success: false, error: "Lütfen ilgili cari hesabý seçin." }

    // Dinamik Vergisel Hesaplamalar
    const taxAmount = totalAmount * (taxRate / 100)
    const grandTotal = totalAmount + taxAmount

    // Resmi Fatura No Simülasyonu
    const currentYear = new Date().getFullYear()
    const randomSerial = Math.floor(Math.random() * 900000) + 100000
    const invoiceNumber = `GIB${currentYear}000${randomSerial}`

    // UUID Üretimi
    const uuid = (() => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    })()

    await prisma.eInvoice.create({
      data: {
        invoiceNumber,
        direction,
        scenario,
        companyId,
        totalAmount,
        taxAmount,
        grandTotal,
        status: 'GIB_ONAYLANDI',
        uuid
      }
    })

    revalidatePath('/dashboard/invoices')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Fatura resmi sisteme kaydedilirken bir hata oluþtu." }
  }
}