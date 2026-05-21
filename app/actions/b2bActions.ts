'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TicketStatus } from '@prisma/client'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

// 1. TÜM KAMPANYALARI GETİR
export async function getCampaigns() {
  try {
    const campaigns = await prisma.b2bCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, campaigns }
  } catch (error) {
    return { success: false, error: "Kampanyalar yüklenemedi." }
  }
}

// 2. YENİ KAMPANYA / DUYURU YAYINLA
export async function createCampaign(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const endDate = new Date(formData.get('endDate') as string)

    await prisma.b2bCampaign.create({
      data: { title, description, endDate }
    })

    revalidatePath('/dashboard/b2b-portal')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Kampanya yayınlanırken bir hata oluştu." }
  }
}

// 3. TÜM BAYİ DESTEK TALEPLERİNİ (TICKETS) FİRMA BİLGİSİYLE GETİR
export async function getTickets() {
  try {
    const tickets = await prisma.b2bTicket.findMany({
      orderBy: { updatedAt: 'desc' }
    })

    // Company bilgilerini manuel eşleştiriyoruz (Prisma ilişkisi kurmadığımız güvenli model için)
    const companyIds = tickets.map(t => t.companyId)
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } }
    })

    const ticketsWithCompany = tickets.map(ticket => ({
      ...ticket,
      company: companies.find(c => c.id === ticket.companyId) || { name: 'Bilinmeyen Bayi' }
    }))

    return { success: true, tickets: ticketsWithCompany }
  } catch (error) {
    return { success: false, error: "Destek talepleri yüklenemedi." }
  }
}

// 4. BAYİ İÇİN SİMÜLE DESTEK TALEBİ OLUŞTUR (TESTLER VE DEMO İÇİN)
export async function createB2bTicket(formData: FormData) {
  try {
    const companyId = formData.get('companyId') as string
    const title = formData.get('title') as string
    const message = formData.get('message') as string

    await prisma.b2bTicket.create({
      data: { companyId, title, message, status: 'OPEN' }
    })

    revalidatePath('/dashboard/b2b-portal')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Talep oluşturulamadı." }
  }
}

// 5. DESTEK TALEBİ DURUMUNU GÜNCELLE (Örn: Çözüldü / İnceleniyor)
export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  try {
    await prisma.b2bTicket.update({
      where: { id: ticketId },
      data: { status }
    })

    revalidatePath('/dashboard/b2b-portal')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Talep durumu güncellenemedi." }
  }
}