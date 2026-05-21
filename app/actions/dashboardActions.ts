'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
// @prisma/client'tan import etme, tipi kendin tanımla:
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export async function getDashboardStats() {
  try {
    // 1. Giren kişinin rolünü çerezden okuyoruz
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('erp_session')
    if (!sessionCookie) return { success: false, error: 'Oturum bulunamadı' }
    
    const sessionData = JSON.parse(sessionCookie.value)
    const { role, name } = sessionData

    // 2. Döndürülecek dinamik veri objesi
    const stats: any = { role, name, finance: null, hr: null, sales: null, warehouse: null }

    // 3. YETKİYE GÖRE VERİTABANI SORGULARI (Sadece görebileceği veriler çekilir)
    const canSeeFinance = ['ADMIN', 'COORDINATOR', 'FINANCE'].includes(role)
    const canSeeHR = ['ADMIN', 'COORDINATOR', 'HR'].includes(role)
    const canSeeSales = ['ADMIN', 'COORDINATOR', 'SALES'].includes(role)
    const canSeeWarehouse = ['ADMIN', 'COORDINATOR', 'WAREHOUSE_MANAGER', 'WAREHOUSE_STAFF', 'PURCHASING'].includes(role)

    // MUHASEBE & FİNANS DATASI
    if (canSeeFinance) {
      const totalCash = await prisma.cashAccount.aggregate({ _sum: { balance: true } })
      const outgoingInvoices = await prisma.eInvoice.count({ where: { direction: 'OUTGOING' } })
      const incomingInvoices = await prisma.eInvoice.count({ where: { direction: 'INCOMING' } })
      stats.finance = {
        totalBalance: totalCash._sum.balance || 0,
        outgoingInvoices,
        incomingInvoices
      }
    }

    // İNSAN KAYNAKLARI DATASI
    if (canSeeHR) {
      const totalEmployees = await prisma.employee.count()
      const totalAdvance = await prisma.payroll.aggregate({
        _sum: { amount: true },
        where: { type: 'ADVANCE' }
      })
      stats.hr = {
        totalEmployees,
        totalAdvance: totalAdvance._sum.amount || 0
      }
    }

    // SATIŞ & CRM DATASI
    if (canSeeSales) {
      const wonDeals = await prisma.crmLead.count({ where: { status: 'WON' } })
      const pendingDeals = await prisma.crmLead.count({ where: { status: { in: ['CONTACTED', 'MEETING', 'PROPOSAL'] } } })
      const totalTickets = await prisma.b2bTicket.count({ where: { status: 'OPEN' } })
      stats.sales = { wonDeals, pendingDeals, totalTickets }
    }

    // LOJİSTİK, DEPO & ÜRETİM DATASI
    if (canSeeWarehouse) {
      const plannedProduction = await prisma.productionOrder.count({ where: { status: 'PLANNED' } })
      const completedProduction = await prisma.productionOrder.count({ where: { status: 'COMPLETED' } })
      const vehiclesOnRoute = await prisma.vehicle.count({ where: { status: 'ACTIVE' } })
      const ecommerceOrders = await prisma.externalOrder.count({ where: { status: 'Yeni Sipariş' } })
      
      stats.warehouse = { plannedProduction, completedProduction, vehiclesOnRoute, ecommerceOrders }
    }

    return { success: true, stats }
  } catch (error) {
    return { success: false, error: "Dashboard verileri yüklenirken hata oluştu." }
  }
}