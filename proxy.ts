import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. KURUMSAL YETKİ MATRİSİ (RBAC - Role Based Access Control)
// Hangi rolün hangi modül URL'lerine girmeye yetkisi var?
const rolePermissions: Record<string, string[]> = {
  ADMIN: ['*'], // Tanrı Modu - Her yere girebilir
  COORDINATOR: ['*'], // Süper Kullanıcı - Her yere girebilir
  FINANCE: ['/dashboard/finance', '/dashboard/invoices', '/dashboard/companies'],
  HR: ['/dashboard/hr'],
  SALES: ['/dashboard/crm', '/dashboard/b2b-portal', '/dashboard/ecommerce', '/dashboard/companies'],
  PURCHASING: ['/dashboard/invoices', '/dashboard/companies', '/dashboard/products', '/dashboard/excel'],
  WAREHOUSE_MANAGER: ['/dashboard/products', '/dashboard/recipes', '/dashboard/vehicles', '/dashboard/excel', '/dashboard/terminal'],
  WAREHOUSE_RECEIVING: ['/dashboard/terminal'], // Sadece terminale girebilir (Mal Kabul)
  WAREHOUSE_STAFF: ['/dashboard/recipes', '/dashboard/terminal'] // Sadece iş emirlerini ve terminali (Mal Çıkış) görebilir
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('erp_session')

  // KURAL 1: Kullanıcı GİRİŞ YAPMAMIŞSA ve Dashboard'a girmeye çalışıyorsa -> Login'e at
  if (!sessionCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // KURAL 2: Kullanıcı GİRİŞ YAPMIŞSA ve Login ekranına geri dönmeye çalışıyorsa -> Dashboard'a at
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // KURAL 3: YETKİ KONTROLÜ (Sayfa bazlı koruma)
  if (sessionCookie && pathname.startsWith('/dashboard/') && pathname !== '/dashboard/unauthorized') {
    try {
      const sessionData = JSON.parse(sessionCookie.value)
      const userRole = sessionData.role

      // ADMIN veya COORDINATOR ise hiç kontrol etmeden direkt geçir
      if (userRole === 'ADMIN' || userRole === 'COORDINATOR') {
        return NextResponse.next()
      }

      // Diğer personeller için yetki matrisini kontrol et
      const allowedPaths = rolePermissions[userRole] || []
      
      const hasAccess = allowedPaths.some(path => pathname.startsWith(path))

      if (!hasAccess) {
        // Yetkisi yoksa panik ekranına at
        return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url))
      }

    } catch (error) {
      // Çerez bozuksa sil ve login'e at
      request.cookies.delete('erp_session')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}