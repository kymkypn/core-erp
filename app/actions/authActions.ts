'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// 1. İLK KURULUM SİHİRBAZI (SİSTEMDE HİÇ KULLANICI YOKSA ÇALIŞIR)
export async function setupFirstAdmin(formData: FormData) {
  try {
    // 🚨 GÜVENLİK KONTROLÜ: Eğer veritabanında en az 1 kullanıcı varsa, bu kurulumu anında engelle!
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      return { success: false, error: "Güvenlik İhlali: Sistemde zaten bir kurulum yapılmış. Bu ekran sadece ilk kurulumda kullanılabilir." }
    }

    const name = formData.get('name') as string
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const phone = formData.get('phone') as string || "0000000000"

    if (!name || !username || !password) {
      return { success: false, error: "Lütfen tüm zorunlu alanları doldurun." }
    }

    // İlk ve En Yetkili ADMIN Kullanıcısını (Sistemin Sahibini) Oluştur
    const adminUser = await prisma.user.create({
      data: {
        name,
        username,
        password, // Not: Canlı ortamda bcrypt ile şifrelenmelidir
        phone,
        role: 'ADMIN', // SİSTEMİN TANRISI
        isTwoFactorActive: false
      }
    })

    // Hesabı oluşturur oluşturmaz kişiyi yormadan direkt sistemi açıyoruz (Çerez basıyoruz)
    const sessionData = JSON.stringify({
      id: adminUser.id,
      name: adminUser.name,
      role: adminUser.role,
      isTwoFactorActive: adminUser.isTwoFactorActive
    })

    cookies().set('erp_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 Saatlik Oturum
      path: '/',
    })

    return { success: true }
  } catch (error) {
    console.error("Kurulum Hatası:", error)
    return { success: false, error: "Sistem yöneticisi oluşturulurken veritabanı hatası oluştu." }
  }
}

// 2. KULLANICI GİRİŞİ (LOGIN)
export async function loginUser(formData: FormData) {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // Kullanıcıyı veritabanında bul
    const user = await prisma.user.findUnique({
      where: { username }
    })

    // Şifre eşleşiyor mu kontrol et
    if (!user || user.password !== password) {
      return { success: false, error: "Kullanıcı adı veya şifre hatalı!" }
    }

    // Güvenli Çerez (Cookie) Oluşturma
    const sessionData = JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
      isTwoFactorActive: user.isTwoFactorActive
    })

    cookies().set('erp_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 Saat
      path: '/',
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Giriş yapılırken sunucu hatası oluştu." }
  }
}

// 3. SİSTEMDEN GÜVENLİ ÇIKIŞ (LOGOUT)
export async function logoutUser() {
  cookies().delete('erp_session')
  redirect('/login')
}

// 4. GİRİŞ YAPMIŞ KULLANICININ SEANS BİLGİSİNİ GETİR (UI Tarafında Rol Kontrolü İçin)
export async function GetUserSession() {
  const sessionCookie = cookies().get('erp_session')
  if (!sessionCookie) return null
  
  try {
    return JSON.parse(sessionCookie.value)
  } catch (error: any) {
    console.error("Kurulum Hatası:", error)
    // Hatayı gizlemiyoruz, direkt ekrana basıyoruz ki ne olduğunu bilelim!
    return { success: false, error: "DB Hatası: " + error.message }
  }
}