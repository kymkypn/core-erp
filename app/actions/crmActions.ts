'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { LeadStatus } from '@prisma/client'

// 1. TÜM POTANSİYEL MÜŞTERİLERİ (LEADS) GÖRÜŞME GEÇMİŞİYLE BİRLİKTE GETİR
export async function getLeads() {
  try {
    const leads = await prisma.crmLead.findMany({
      include: {
        meetings: true
      },
      orderBy: { updatedAt: 'desc' }
    })
    return { success: true, leads }
  } catch (error) {
    return { success: false, error: "Potansiyel müşteri listesi yüklenemedi." }
  }
}

// 2. YENİ POTANSİYEL MÜŞTERİ (LEAD) EKLE
export async function createLead(formData: FormData) {
  try {
    const companyName = formData.get('companyName') as string
    const contactName = formData.get('contactName') as string || null
    const phone = formData.get('phone') as string || null
    const email = formData.get('email') as string || null
    const title = formData.get('title') as string
    const value = parseFloat(formData.get('value') as string) || 0
    const notes = formData.get('notes') as string || null

    await prisma.crmLead.create({
      data: { companyName, contactName, phone, email, title, value, notes }
    })

    revalidatePath('/dashboard/crm')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Aday kaydı eklenirken bir hata oluştu." }
  }
}

// 3. ADAYIN SATIŞ DURUMUNU GÜNCELLE (HUNİ GEÇİŞLERİ İÇİN)
export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  try {
    await prisma.crmLead.update({
      where: { id: leadId },
      data: { status }
    })

    revalidatePath('/dashboard/crm')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Aday durumu güncellenemedi." }
  }
}

// 4. ADAY İÇİN YENİ GÖRÜŞME / TOPLANTI NOTU EKLE
export async function createMeetingEntry(formData: FormData) {
  try {
    const leadId = formData.get('leadId') as string
    const date = new Date(formData.get('date') as string)
    const type = formData.get('type') as string
    const notes = formData.get('notes') as string
    const nextAction = formData.get('nextAction') as string || null

    await prisma.$transaction(async (tx) => {
      // Görüşmeyi ekle
      await tx.crmMeeting.create({
        data: { leadId, date, type, notes, nextAction }
      })

      // Adayın son etkileşim tarihini güncelle ki huni canlı kalsın
      await tx.crmLead.update({
        where: { id: leadId },
        data: { updatedAt: new Date() }
      })
    })

    revalidatePath('/dashboard/crm')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Görüşme kaydı eklenemedi." }
  }
}
