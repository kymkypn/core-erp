'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'

// 1. TÜM KULLANICILARI GETİR
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        isTwoFactorActive: true,
        createdAt: true,
        // Güvenlik gereği password ve twoFactorSecret alanlarını UI tarafına asla göndermiyoruz!
      }
    })
    return { success: true, users }
  } catch (error) {
    return { success: false, error: "Kullanıcı listesi yüklenemedi." }
  }
}

// 2. YENİ PERSONEL (KULLANICI) OLUŞTUR
export async function createUser(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const username = formData.get('username') as string
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as Role

    // Kullanıcı adı (Örn: ahmet.yilmaz) sistemde benzersiz olmalı
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) return { success: false, error: "Bu kullanıcı adı zaten sistemde kayıtlı!" }

    await prisma.user.create({
      data: {
        name,
        username,
        phone,
        password, // Not: Gerçek canlı ortamda buralar bcrypt ile şifrelenir
        role
      }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Sisteme kullanıcı eklenirken bir hata oluştu." }
  }
}

// 3. KULLANICININ ROLÜNÜ (YETKİSİNİ) GÜNCELLE
export async function updateUserRole(userId: string, role: Role) {
  try {
    // ADMIN (Patron) kendi yetkisini yanlışlıkla düşüremesin diye güvenlik kalkanı
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role === 'ADMIN' && role !== 'ADMIN') {
      return { success: false, error: "Sistem yöneticisinin (ADMIN) yetkisi düşürülemez!" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Kullanıcı yetkisi güncellenemedi." }
  }
}

// 4. KULLANICIYI SİSTEMDEN SİL (İŞTEN ÇIKIŞ VS.)
export async function deleteUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role === 'ADMIN') {
      return { success: false, error: "Sistem yöneticisi (ADMIN) hesabı silinemez!" }
    }

    await prisma.user.delete({ where: { id: userId } })
    
    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Kullanıcı silinemedi." }
  }
}