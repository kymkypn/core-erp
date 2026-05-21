'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { processExcelData } from '@/app/actions/excelActions'

export default function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  // 1. Dosya Sürükle & Bırak İşlemleri
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      checkAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      checkAndSetFile(e.target.files[0])
    }
  }

  const checkAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      alert("Lütfen sadece geçerli bir Excel (.xlsx, .xls) dosyası yükleyin!")
      return
    }
    setFile(selectedFile)
    setResult(null)
  }

  // 2. Excel Okuma ve Sunucuya Gönderme
  const processFile = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Şablondaki verilerin olduğu 2. Sekmeyi ("Toplu Ürün Listesi") al
        const sheetName = workbook.SheetNames.includes('Toplu Ürün Listesi') 
          ? 'Toplu Ürün Listesi' 
          : workbook.SheetNames[0]
          
        const worksheet = workbook.Sheets[sheetName]
        
        // Exceli JSON Array'ine çevir
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length === 0) {
          setResult({ success: false, error: "Excel dosyasının içi boş veya veri bulunamadı." })
          setLoading(false)
          return
        }

        // Sunucu aksiyonunu çağırıp JSON'u veritabanına bastır
        const response = await processExcelData(jsonData)
        setResult(response as any)
        
        if (response.success) setFile(null) // Başarılıysa seçili dosyayı temizle

      } catch (error) {
        setResult({ success: false, error: "Dosya okunurken bir hata oluştu. Lütfen standart şablonu kullanın." })
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="space-y-6">
      
      {/* Üst Bilgi Kartı */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-sm border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            📊 Excel ile Toplu Veri Yönetimi
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-2 max-w-xl">
            Sisteme tanımlamak istediğiniz binlerce ürünü veya mevcut stok/fiyat güncellemelerinizi standart Excel şablonumuzla tek seferde sisteme aktarabilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SOL: SÜRÜKLE BIRAK ALANI */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">📥 İçe Aktarma Sihirbazı</h3>
          
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
          >
            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
                  📗
                </div>
                <h4 className="font-black text-emerald-800 text-lg">{file.name}</h4>
                <p className="text-xs font-bold text-emerald-600">Dosya analize hazır ({(file.size / 1024).toFixed(2)} KB)</p>
                <button 
                  onClick={() => setFile(null)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline mt-4"
                >
                  Dosyayı İptal Et
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
                  📑
                </div>
                <h4 className="font-black text-slate-700 text-lg">Excel Dosyanızı Buraya Sürükleyin</h4>
                <p className="text-xs font-medium text-slate-500">veya cihazınızdan seçmek için aşağıdaki butona tıklayın</p>
                
                <input type="file" id="excel-upload" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
                <label 
                  htmlFor="excel-upload" 
                  className="inline-block mt-4 px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-50 hover:shadow-sm transition-all"
                >
                  Dosya Seç
                </label>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button 
              onClick={processFile}
              disabled={!file || loading}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md ${(!file || loading) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-500/25'}`}
            >
              {loading ? 'Veriler Sisteme İşleniyor, Lütfen Bekleyin...' : '🚀 Veritabanına Aktarmayı Başlat'}
            </button>
          </div>

          {/* SONUÇ BİLDİRİMİ */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl border font-bold text-sm text-center ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {result.success ? `✅ Başarılı: ${result.message}` : `❌ Hata: ${result.error}`}
            </div>
          )}
        </div>

        {/* SAĞ: ŞABLON VE BİLGİ KARTI */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">💡 Şablon Kuralları</h3>
          
          <ul className="space-y-4 text-xs font-medium text-slate-600">
            <li className="flex gap-2">
              <span className="text-blue-500">1.</span>
              Aşağıdaki linkten standart ERP Excel şablonumuzu indirin.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">2.</span>
              Sütun başlıklarını (Ürün Kodu, Ürün Adı, Mevcut Stok) kesinlikle değiştirmeyin.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">3.</span>
              Mevcut sistemde kayıtlı bir "Ürün Adı" yazarsanız, sistem onu yeni bir ürün olarak eklemez, onun stoğunu günceller.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">4.</span>
              Aynı anda en fazla 5.000 satır (ürün) yüklemeniz önerilir.
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            {/* Not: Müşterin bu butona basarak yukarıda oluşturduğumuz Excel'i indirebilir */}
            <a 
              href="/erp_toplu_urun_sablonu.xlsx" 
              download
              className="inline-block w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              📥 Standart Excel Şablonunu İndir
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}