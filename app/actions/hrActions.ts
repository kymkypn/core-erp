// ==========================================
// 8. İNSAN KAYNAKLARI (HR) VE BORDRO YÖNETİMİ
// ==========================================

enum EmployeeStatus {
  ACTIVE      // Çalışıyor
  ON_LEAVE    // İzinde / Raporlu
  TERMINATED  // İşten Ayrıldı
}

enum PaymentType {
  SALARY      // Normal Maaş
  ADVANCE     // Avans (Maaştan düşülecek)
  BONUS       // Prim / Ödül
}

// Şirket Personelleri (Sisteme giriş yapan 'User' olmak zorunda değiller. Şoför, depocu vs. hepsi buraya girer)
model Employee {
  id            String         @id @default(cuid())
  tcNo          String?        @unique
  firstName     String
  lastName      String
  position      String         // Örn: "Forklift Operatörü", "Muhasebe Uzmanı"
  department    String         // Örn: "Lojistik", "Finans", "Üretim"
  phone         String?
  iban          String?        // Maaş yatırılacak hesap
  
  baseSalary    Float          // Net/Brüt Maaş Tutarı
  hireDate      DateTime       @default(now()) // İşe giriş tarihi
  status        EmployeeStatus @default(ACTIVE)

  leaves        Leave[]        // Personelin İzinleri
  payrolls      Payroll[]      // Personelin Maaş/Avans Geçmişi
  
  createdAt     DateTime       @default(now())
}

// Yıllık İzinler, Raporlar ve Mazeret İzinleri
model Leave {
  id            String    @id @default(cuid())
  employeeId    String
  employee      Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  type          String    // Örn: "Yıllık İzin", "Sağlık Raporu", "Evlilik İzni"
  startDate     DateTime
  endDate       DateTime
  status        String    @default("PENDING") // PENDING (Onay Bekliyor), APPROVED (Onaylandı), REJECTED (Reddedildi)
  description   String?
  
  createdAt     DateTime  @default(now())
}

// Maaş, Avans ve Prim Ödemeleri
model Payroll {
  id            String      @id @default(cuid())
  employeeId    String
  employee      Employee    @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  type          PaymentType
  amount        Float       // Ödenen veya kesilen tutar
  month         Int         // Hangi ayın işlemi? (1-12)
  year          Int         // Hangi yıl? (Örn: 2026)
  
  isPaid        Boolean     @default(false) // Para kasadan çıktı mı?
  paymentDate   DateTime?   // Ödemenin yapıldığı tarih
  description   String?     // Örn: "Mayıs Ayı Avansı", "Nisan Maaşı"
  
  createdAt     DateTime    @default(now())
}