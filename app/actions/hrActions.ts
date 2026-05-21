'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getEmployees() {
  return await prisma.employee.findMany({
    include: { payrolls: true, leaves: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createEmployee(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const tcNo = (formData.get('tcNo') as string) || null
    const position = formData.get('position') as string
    const department = formData.get('department') as string
    const phone = (formData.get('phone') as string) || null
    const baseSalary = parseFloat(formData.get('baseSalary') as string) || 0

    await prisma.employee.create({
      data: { firstName, lastName, tcNo, position, department, phone, baseSalary }
    })

    revalidatePath('/dashboard/hr')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Personel kaydı oluşturulamadı.' }
  }
}

export async function createPayrollEntry(formData: FormData) {
  try {
    const employeeId = formData.get('employeeId') as string
    const type = formData.get('type') as 'SALARY' | 'ADVANCE' | 'BONUS'
    const amount = parseFloat(formData.get('amount') as string) || 0
    const month = parseInt(formData.get('month') as string, 10) || new Date().getMonth() + 1
    const year = parseInt(formData.get('year') as string, 10) || new Date().getFullYear()
    const description = (formData.get('description') as string) || null
    const isPaid = formData.get('isPaid') === 'true'
    const accountId = (formData.get('accountId') as string) || null

    const payrollData: any = {
      employeeId,
      type,
      amount,
      month,
      year,
      description,
      isPaid,
      paymentDate: isPaid ? new Date() : null
    }

    if (isPaid && accountId) {
      await prisma.$transaction(async (tx) => {
        await tx.payroll.create({ data: payrollData })
        await tx.cashAccount.update({
          where: { id: accountId },
          data: { balance: { decrement: amount } }
        })
      })
    } else {
      await prisma.payroll.create({ data: payrollData })
    }

    revalidatePath('/dashboard/hr')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Bordro kaydı oluşturulamadı.' }
  }
}

export async function createLeaveEntry(formData: FormData) {
  try {
    const employeeId = formData.get('employeeId') as string
    const type = formData.get('type') as string
    const startDate = new Date(formData.get('startDate') as string)
    const endDate = new Date(formData.get('endDate') as string)
    const description = (formData.get('description') as string) || null

    await prisma.leave.create({
      data: {
        employeeId,
        type,
        startDate,
        endDate,
        status: 'PENDING',
        description
      }
    })

    revalidatePath('/dashboard/hr')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'İzin kaydı oluşturulamadı.' }
  }
}
