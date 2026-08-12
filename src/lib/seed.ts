/**
 * Demo veri seti.
 *
 * Uygulama ilk açıldığında (veya şema sürümü değiştiğinde) localStorage
 * bu verilerle doldurulur. Amaç: boş bir vitrin yerine, tüm özellikleri
 * (iç içe kategoriler, favoriler, mesajlaşma, takip) hemen gösteren
 * canlı bir pazar yeri sunmak.
 */

import type { AdminLog, Category, Favorite, Follow, Message, Product, User } from '@/interfaces'
import { hashPassword } from './crypto'

/** Demo hesapların düz parolaları — giriş ekranında ipucu olarak gösterilir. */
export const DEMO_ACCOUNTS = {
  admin: { email: 'admin@alpasa.app', password: 'Admin123' },
  user: { email: 'demo@alpasa.app', password: 'Demo123' },
} as const

const now = Date.now()
const DAY = 1000 * 60 * 60 * 24

/** n gün önce (ve saat kaydırması) ISO dizesi üretir. */
function ago(days: number, hours = 0): string {
  return new Date(now - days * DAY - hours * 60 * 60 * 1000).toISOString()
}

function photo(seed: string): string {
  return `https://picsum.photos/seed/${seed}/800/600`
}

interface SeedUserSpec {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'Admin' | 'User'
  city: string
  bio: string
}

const USER_SPECS: SeedUserSpec[] = [
  {
    id: 'usr_admin',
    email: DEMO_ACCOUNTS.admin.email,
    password: DEMO_ACCOUNTS.admin.password,
    firstName: 'Sistem',
    lastName: 'Yöneticisi',
    role: 'Admin',
    city: 'İstanbul',
    bio: 'AlPaSa platform yöneticisi. Kategori ve ilan denetiminden sorumlu.',
  },
  {
    id: 'usr_demo',
    email: DEMO_ACCOUNTS.user.email,
    password: DEMO_ACCOUNTS.user.password,
    firstName: 'Demo',
    lastName: 'Kullanıcı',
    role: 'User',
    city: 'Ankara',
    bio: 'Elektronik ve kitap koleksiyoncusu. Ev değiştirdiğim için bazı eşyalarımı satıyorum.',
  },
  {
    id: 'usr_elif',
    email: 'elif@alpasa.app',
    password: 'Elif123',
    firstName: 'Elif',
    lastName: 'Demir',
    role: 'User',
    city: 'İzmir',
    bio: 'Vintage mobilya ve ev dekorasyonu tutkunu.',
  },
  {
    id: 'usr_mert',
    email: 'mert@alpasa.app',
    password: 'Mert123',
    firstName: 'Mert',
    lastName: 'Kaya',
    role: 'User',
    city: 'Bursa',
    bio: 'Müzisyen. Enstrüman alım satımı yapıyorum, her ürün bakımlı.',
  },
  {
    id: 'usr_zeynep',
    email: 'zeynep@alpasa.app',
    password: 'Zeynep123',
    firstName: 'Zeynep',
    lastName: 'Aydın',
    role: 'User',
    city: 'Antalya',
    bio: 'Spor ekipmanları ve outdoor malzemeleri.',
  },
  {
    id: 'usr_can',
    email: 'can@alpasa.app',
    password: 'Can123',
    firstName: 'Can',
    lastName: 'Öztürk',
    role: 'User',
    city: 'Eskişehir',
    bio: 'Bilgisayar toplama ve donanım yükseltme ile ilgileniyorum.',
  },
]

const CATEGORIES: Category[] = [
  // --- Kök kategoriler ---
  { id: 'cat_elektronik', name: 'Elektronik', description: 'Telefon, bilgisayar, ses ve görüntü sistemleri.', parentId: null, icon: 'Cpu', createdAt: ago(120) },
  { id: 'cat_ev', name: 'Ev & Yaşam', description: 'Mobilya, beyaz eşya ve mutfak ürünleri.', parentId: null, icon: 'Sofa', createdAt: ago(120) },
  { id: 'cat_moda', name: 'Moda', description: 'Giyim, ayakkabı ve aksesuar.', parentId: null, icon: 'Shirt', createdAt: ago(120) },
  { id: 'cat_hobi', name: 'Hobi & Spor', description: 'Müzik aletleri, spor ekipmanları ve kitaplar.', parentId: null, icon: 'Music', createdAt: ago(120) },
  { id: 'cat_arac', name: 'Araç & Yedek Parça', description: 'Bisiklet, oto aksesuar ve yedek parçalar.', parentId: null, icon: 'Bike', createdAt: ago(120) },

  // --- Elektronik alt dalları ---
  { id: 'cat_bilgisayar', name: 'Bilgisayar', description: 'Masaüstü ve dizüstü bilgisayarlar, bileşenler.', parentId: 'cat_elektronik', icon: 'Laptop', createdAt: ago(118) },
  { id: 'cat_dizustu', name: 'Dizüstü', description: 'Taşınabilir bilgisayarlar.', parentId: 'cat_bilgisayar', icon: 'Laptop', createdAt: ago(115) },
  { id: 'cat_donanim', name: 'Donanım', description: 'Ekran kartı, işlemci, RAM ve diğer bileşenler.', parentId: 'cat_bilgisayar', icon: 'HardDrive', createdAt: ago(115) },
  { id: 'cat_telefon', name: 'Telefon', description: 'Akıllı telefonlar ve aksesuarları.', parentId: 'cat_elektronik', icon: 'Smartphone', createdAt: ago(118) },
  { id: 'cat_ses', name: 'Ses & Görüntü', description: 'Kulaklık, hoparlör, televizyon.', parentId: 'cat_elektronik', icon: 'Headphones', createdAt: ago(118) },

  // --- Ev & Yaşam alt dalları ---
  { id: 'cat_mobilya', name: 'Mobilya', description: 'Koltuk, masa, sandalye, dolap.', parentId: 'cat_ev', icon: 'Sofa', createdAt: ago(110) },
  { id: 'cat_beyazesya', name: 'Beyaz Eşya', description: 'Buzdolabı, çamaşır makinesi, fırın.', parentId: 'cat_ev', icon: 'Refrigerator', createdAt: ago(110) },
  { id: 'cat_mutfak', name: 'Mutfak', description: 'Küçük ev aletleri ve mutfak gereçleri.', parentId: 'cat_ev', icon: 'CookingPot', createdAt: ago(110) },

  // --- Moda alt dalları ---
  { id: 'cat_kadin', name: 'Kadın Giyim', description: 'Elbise, ceket, kazak.', parentId: 'cat_moda', icon: 'Shirt', createdAt: ago(100) },
  { id: 'cat_erkek', name: 'Erkek Giyim', description: 'Gömlek, pantolon, mont.', parentId: 'cat_moda', icon: 'Shirt', createdAt: ago(100) },
  { id: 'cat_ayakkabi', name: 'Ayakkabı & Çanta', description: 'Ayakkabı, çanta ve aksesuar.', parentId: 'cat_moda', icon: 'ShoppingBag', createdAt: ago(100) },

  // --- Hobi & Spor alt dalları ---
  { id: 'cat_muzik', name: 'Müzik Aletleri', description: 'Gitar, klarnet, klavye ve diğer enstrümanlar.', parentId: 'cat_hobi', icon: 'Music', createdAt: ago(95) },
  { id: 'cat_spor', name: 'Spor Ekipmanları', description: 'Fitness, outdoor ve takım sporları.', parentId: 'cat_hobi', icon: 'Dumbbell', createdAt: ago(95) },
  { id: 'cat_kitap', name: 'Kitap & Dergi', description: 'Roman, ders kitabı, koleksiyon dergileri.', parentId: 'cat_hobi', icon: 'BookOpen', createdAt: ago(95) },

  // --- Araç alt dalları ---
  { id: 'cat_bisiklet', name: 'Bisiklet', description: 'Şehir, dağ ve yol bisikletleri.', parentId: 'cat_arac', icon: 'Bike', createdAt: ago(90) },
  { id: 'cat_oto', name: 'Oto Aksesuar', description: 'İç ve dış araç aksesuarları.', parentId: 'cat_arac', icon: 'Car', createdAt: ago(90) },
]

interface SeedProductSpec {
  id: string
  title: string
  description: string
  price: number
  condition: Product['condition']
  categoryId: string
  sellerId: string
  city: string
  seed: string
  days: number
  views: number
  isSold?: boolean
  isFeatured?: boolean
}

const PRODUCT_SPECS: SeedProductSpec[] = [
  {
    id: 'prd_macbook', title: 'MacBook Air M1 — 8GB / 256GB',
    description: '2021 model MacBook Air M1. Şarj döngüsü 142, batarya sağlığı %94. Kutusu ve orijinal şarj adaptörü mevcut. Ekranda çizik yok, klavye ve trackpad sorunsuz. Yüksek performanslı bir makineye geçtiğim için satıyorum.',
    price: 21500, condition: 'Yeni Gibi', categoryId: 'cat_dizustu', sellerId: 'usr_can', city: 'Eskişehir', seed: 'macbookair', days: 2, views: 412, isFeatured: true,
  },
  {
    id: 'prd_ekrankarti', title: 'NVIDIA RTX 3060 Ti 8GB Ekran Kartı',
    description: 'Oyun bilgisayarımda 1,5 yıl kullanıldı, hiç overclock yapılmadı. Termal macunu geçen ay yenilendi. Kutusu duruyor. Test edilerek teslim edilir.',
    price: 8750, condition: 'İyi', categoryId: 'cat_donanim', sellerId: 'usr_can', city: 'Eskişehir', seed: 'gpucard', days: 5, views: 289,
  },
  {
    id: 'prd_iphone', title: 'iPhone 13 128GB — Yıldız Işığı',
    description: 'İkinci el iPhone 13, batarya sağlığı %89. İlk günden beri kılıflı ve ekran koruyuculu kullanıldı. Faturası mevcut. Takas düşünmüyorum.',
    price: 24900, condition: 'İyi', categoryId: 'cat_telefon', sellerId: 'usr_demo', city: 'Ankara', seed: 'iphone13', days: 1, views: 537, isFeatured: true,
  },
  {
    id: 'prd_kulaklik', title: 'Sony WH-1000XM4 Kablosuz Kulaklık',
    description: 'Gürültü engelleme özelliği mükemmel çalışıyor. Taşıma kılıfı, kablo ve uçak adaptörü dahil. Kulak yastıkları orijinal ve yıpranmamış durumda.',
    price: 5400, condition: 'Yeni Gibi', categoryId: 'cat_ses', sellerId: 'usr_demo', city: 'Ankara', seed: 'headphones', days: 8, views: 198,
  },
  {
    id: 'prd_monitor', title: 'Dell UltraSharp 27" 4K Monitör',
    description: 'Renk kalibrasyonu yapılmış profesyonel monitör. Ölü piksel yok. Stand ve DisplayPort kablosu dahil. Grafik işleriyle uğraşanlar için ideal.',
    price: 9200, condition: 'İyi', categoryId: 'cat_ses', sellerId: 'usr_can', city: 'Eskişehir', seed: 'monitor4k', days: 14, views: 156,
  },
  {
    id: 'prd_koltuk', title: 'Vintage Üç Kişilik Kadife Koltuk',
    description: "1970'ler tarzı, yeni döşenmiş kadife koltuk. Ahşap ayakları cilalandı. Leke ve yırtık yok. Nakliye alıcıda, İzmir içi taşıma konusunda yardımcı olabilirim.",
    price: 12000, condition: 'Yeni Gibi', categoryId: 'cat_mobilya', sellerId: 'usr_elif', city: 'İzmir', seed: 'velvetsofa', days: 3, views: 341, isFeatured: true,
  },
  {
    id: 'prd_masa', title: 'Meşe Ağaçı Çalışma Masası 140x70',
    description: 'Masif meşe, el yapımı çalışma masası. Kablo geçiş deliği ve alt rafı var. Küçük bir daireye taşındığım için satıyorum. Sıfır gibi.',
    price: 4800, condition: 'İyi', categoryId: 'cat_mobilya', sellerId: 'usr_elif', city: 'İzmir', seed: 'oakdesk', days: 11, views: 174,
  },
  {
    id: 'prd_buzdolabi', title: 'Bosch No-Frost Buzdolabı 480L',
    description: 'A++ enerji sınıfı, no-frost buzdolabı. 4 yaşında, servis geçmişi temiz. Taşınma nedeniyle satılıyor. Çalışır durumda test edilebilir.',
    price: 15500, condition: 'İyi', categoryId: 'cat_beyazesya', sellerId: 'usr_elif', city: 'İzmir', seed: 'fridge', days: 20, views: 122,
  },
  {
    id: 'prd_kahve', title: 'Delonghi Espresso Makinesi',
    description: 'Yarı otomatik espresso makinesi, süt köpürtücülü. Kireç çözdürme işlemi düzenli yapıldı. Portafiltre ve tamper dahil.',
    price: 3200, condition: 'İyi', categoryId: 'cat_mutfak', sellerId: 'usr_demo', city: 'Ankara', seed: 'espresso', days: 6, views: 203,
  },
  {
    id: 'prd_klarnet', title: 'Jupiter JCL-700 Sib Klarnet',
    description: 'Öğrenci ve orta seviye için ideal klarnet. Pedleri geçen sezon değiştirildi, ayarları yapıldı. Orijinal çantası, temizlik bezi ve 3 adet kamış hediye.',
    price: 7800, condition: 'Yeni Gibi', categoryId: 'cat_muzik', sellerId: 'usr_mert', city: 'Bursa', seed: 'clarinet', days: 4, views: 267, isFeatured: true,
  },
  {
    id: 'prd_gitar', title: 'Fender Player Stratocaster Elektro Gitar',
    description: 'Meksika üretimi Player serisi Stratocaster. Setup yapıldı, teller yeni. Gigbag dahil. Gövdede küçük bir çizik dışında kusursuz.',
    price: 26500, condition: 'İyi', categoryId: 'cat_muzik', sellerId: 'usr_mert', city: 'Bursa', seed: 'stratocaster', days: 9, views: 389,
  },
  {
    id: 'prd_klavye', title: 'Yamaha P-45 Dijital Piyano 88 Tuş',
    description: 'Çekiçli tuş mekanizmalı dijital piyano. Sehpası ve pedalı dahil. Ev ortamında az kullanıldı, sigara içilmeyen ortam.',
    price: 14200, condition: 'Yeni Gibi', categoryId: 'cat_muzik', sellerId: 'usr_mert', city: 'Bursa', seed: 'digitalpiano', days: 25, views: 145,
  },
  {
    id: 'prd_bisiklet', title: 'Trek Marlin 7 Dağ Bisikleti — M Beden',
    description: 'Hidrolik disk fren, 1x10 vites sistemi. Rotor ve balatalar yeni değiştirildi. Şehir ve patika kullanımına uygun. Pedal ve bidon dahil.',
    price: 18900, condition: 'İyi', categoryId: 'cat_bisiklet', sellerId: 'usr_zeynep', city: 'Antalya', seed: 'mtbbike', days: 7, views: 312,
  },
  {
    id: 'prd_kamp', title: 'Kamp Çadırı 3 Kişilik + Uyku Tulumu',
    description: 'Su geçirmez 3 mevsim çadır ve -5 dereceye kadar uyku tulumu. Toplam 4 kez kullanıldı. Taşıma çantası ve kazık seti tam.',
    price: 2750, condition: 'Yeni Gibi', categoryId: 'cat_spor', sellerId: 'usr_zeynep', city: 'Antalya', seed: 'camptent', days: 12, views: 167,
  },
  {
    id: 'prd_dumbell', title: 'Ayarlanabilir Dambıl Seti 2x24kg',
    description: 'Vidalı tip ayarlanabilir dambıl seti, toplam 48 kg. Pas yok. Ev spor salonu kuranlar için ideal. Elden teslim tercih edilir.',
    price: 3900, condition: 'İyi', categoryId: 'cat_spor', sellerId: 'usr_zeynep', city: 'Antalya', seed: 'dumbbells', days: 18, views: 134,
  },
  {
    id: 'prd_kitaplik', title: 'Bilim Kurgu Kitap Koleksiyonu — 32 Kitap',
    description: 'Asimov, Dick, Le Guin ve Herbert ağırlıklı 32 kitaplık koleksiyon. Çoğu ilk baskı değil ama hepsi sağlam ciltli. Toplu satılır, tek tek verilmez.',
    price: 2400, condition: 'İyi', categoryId: 'cat_kitap', sellerId: 'usr_demo', city: 'Ankara', seed: 'scifibooks', days: 16, views: 221,
  },
  {
    id: 'prd_mont', title: 'The North Face Kışlık Mont — L Beden',
    description: 'Su ve rüzgâr geçirmez, iç astarlı kışlık mont. İki kış giyildi, fermuarlar sorunsuz. Renk: lacivert.',
    price: 4100, condition: 'İyi', categoryId: 'cat_erkek', sellerId: 'usr_can', city: 'Eskişehir', seed: 'winterjacket', days: 22, views: 98,
  },
  {
    id: 'prd_canta', title: 'Deri Omuz Çantası — El Yapımı',
    description: 'Hakiki deri, el dikişi omuz çantası. Laptop bölmesi 14 inçe kadar uygun. Deri doğal patina yapmış, çok şık duruyor.',
    price: 1850, condition: 'Yeni Gibi', categoryId: 'cat_ayakkabi', sellerId: 'usr_elif', city: 'İzmir', seed: 'leatherbag', days: 10, views: 189,
  },
  {
    id: 'prd_elbise', title: 'Vintage İpek Elbise — S Beden',
    description: "90'lar vintage ipek elbise. Butik alım. Leke veya yırtık yok, kuru temizlemeden yeni çıktı.",
    price: 1200, condition: 'Yeni Gibi', categoryId: 'cat_kadin', sellerId: 'usr_elif', city: 'İzmir', seed: 'silkdress', days: 28, views: 76,
  },
  {
    id: 'prd_supurge', title: 'Dyson V11 Şarjlı Dikey Süpürge',
    description: 'Batarya süresi yaklaşık 45 dakika. Tüm aparatları ve duvar şarj ünitesi mevcut. Filtresi yeni yıkandı.',
    price: 8900, condition: 'İyi', categoryId: 'cat_mutfak', sellerId: 'usr_demo', city: 'Ankara', seed: 'vacuum', days: 30, views: 254, isSold: true,
  },
  {
    id: 'prd_otokoltuk', title: 'Bebek Oto Koltuğu 9-36 kg',
    description: 'ECE R44/04 sertifikalı, isofix uyumlu oto koltuğu. Kılıfı yıkandı. Kaza geçirmemiştir.',
    price: 2200, condition: 'İyi', categoryId: 'cat_oto', sellerId: 'usr_zeynep', city: 'Antalya', seed: 'carseat', days: 35, views: 88, isSold: true,
  },
]

const PRODUCTS: Product[] = PRODUCT_SPECS.map((spec) => ({
  id: spec.id,
  title: spec.title,
  description: spec.description,
  price: spec.price,
  condition: spec.condition,
  categoryId: spec.categoryId,
  sellerId: spec.sellerId,
  images: [photo(spec.seed), photo(`${spec.seed}-b`)],
  city: spec.city,
  isSold: spec.isSold ?? false,
  isFeatured: spec.isFeatured ?? false,
  viewCount: spec.views,
  createdAt: ago(spec.days),
  updatedAt: ago(spec.days),
}))

const FAVORITES: Favorite[] = [
  { id: 'fav_1', userId: 'usr_demo', productId: 'prd_koltuk', createdAt: ago(2) },
  { id: 'fav_2', userId: 'usr_demo', productId: 'prd_klarnet', createdAt: ago(3) },
  { id: 'fav_3', userId: 'usr_demo', productId: 'prd_bisiklet', createdAt: ago(1) },
  { id: 'fav_4', userId: 'usr_elif', productId: 'prd_macbook', createdAt: ago(1) },
  { id: 'fav_5', userId: 'usr_elif', productId: 'prd_kulaklik', createdAt: ago(5) },
  { id: 'fav_6', userId: 'usr_mert', productId: 'prd_macbook', createdAt: ago(2) },
  { id: 'fav_7', userId: 'usr_mert', productId: 'prd_ekrankarti', createdAt: ago(4) },
  { id: 'fav_8', userId: 'usr_zeynep', productId: 'prd_macbook', createdAt: ago(1) },
  { id: 'fav_9', userId: 'usr_zeynep', productId: 'prd_gitar', createdAt: ago(6) },
  { id: 'fav_10', userId: 'usr_can', productId: 'prd_koltuk', createdAt: ago(3) },
  { id: 'fav_11', userId: 'usr_can', productId: 'prd_gitar', createdAt: ago(8) },
  { id: 'fav_12', userId: 'usr_demo', productId: 'prd_iphone', createdAt: ago(9) },
  { id: 'fav_13', userId: 'usr_elif', productId: 'prd_bisiklet', createdAt: ago(4) },
]

const FOLLOWS: Follow[] = [
  { id: 'flw_1', followerId: 'usr_demo', followeeId: 'usr_elif', createdAt: ago(15) },
  { id: 'flw_2', followerId: 'usr_demo', followeeId: 'usr_mert', createdAt: ago(12) },
  { id: 'flw_3', followerId: 'usr_elif', followeeId: 'usr_demo', createdAt: ago(10) },
  { id: 'flw_4', followerId: 'usr_can', followeeId: 'usr_mert', createdAt: ago(9) },
  { id: 'flw_5', followerId: 'usr_zeynep', followeeId: 'usr_elif', createdAt: ago(7) },
  { id: 'flw_6', followerId: 'usr_mert', followeeId: 'usr_zeynep', createdAt: ago(5) },
]

const MESSAGES: Message[] = [
  { id: 'msg_1', senderId: 'usr_demo', receiverId: 'usr_elif', productId: 'prd_koltuk', content: 'Merhaba, koltuk hâlâ satılık mı? İzmir dışına kargo yapabilir misiniz?', isRead: true, createdAt: ago(2, 6) },
  { id: 'msg_2', senderId: 'usr_elif', receiverId: 'usr_demo', productId: 'prd_koltuk', content: 'Merhaba, evet satılık. Kargo mümkün ama koltuğun boyutu nedeniyle nakliye firması gerekiyor, ücreti alıcıda olur.', isRead: true, createdAt: ago(2, 4) },
  { id: 'msg_3', senderId: 'usr_demo', receiverId: 'usr_elif', productId: 'prd_koltuk', content: 'Anladım. Nakliye için yaklaşık bir fiyat öğrenebilir miyim? Ankara için.', isRead: false, createdAt: ago(2, 1) },
  { id: 'msg_4', senderId: 'usr_mert', receiverId: 'usr_can', productId: 'prd_macbook', content: 'Selam, MacBook için takas düşünür müsün? Elimde iPad Pro var.', isRead: true, createdAt: ago(1, 8) },
  { id: 'msg_5', senderId: 'usr_can', receiverId: 'usr_mert', productId: 'prd_macbook', content: 'Merhaba, takas düşünmüyorum maalesef. Sadece nakit satış.', isRead: true, createdAt: ago(1, 5) },
  { id: 'msg_6', senderId: 'usr_zeynep', receiverId: 'usr_mert', productId: 'prd_klarnet', content: 'Klarnetin pedleri ne zaman değişti? Yeni başlayan biri için uygun mu?', isRead: false, createdAt: ago(0, 5) },
  { id: 'msg_7', senderId: 'usr_elif', receiverId: 'usr_zeynep', productId: 'prd_bisiklet', content: 'Bisikletin kadro bedeni tam olarak kaç cm? 168 boy için uygun olur mu?', isRead: false, createdAt: ago(0, 2) },
]

const ADMIN_LOGS: AdminLog[] = [
  { id: 'log_1', actorId: 'usr_admin', actorName: 'Sistem Yöneticisi', action: 'Kategori eklendi', detail: '"Oto Aksesuar" kategorisi "Araç & Yedek Parça" altına eklendi.', createdAt: ago(90) },
  { id: 'log_2', actorId: 'usr_admin', actorName: 'Sistem Yöneticisi', action: 'İlan öne çıkarıldı', detail: '"MacBook Air M1" ilanı vitrine alındı.', createdAt: ago(2) },
  { id: 'log_3', actorId: 'usr_admin', actorName: 'Sistem Yöneticisi', action: 'Kullanıcı rolü değiştirildi', detail: 'demo@alpasa.app kullanıcısına User rolü atandı.', createdAt: ago(30) },
  { id: 'log_4', actorId: 'usr_admin', actorName: 'Sistem Yöneticisi', action: 'İlan öne çıkarıldı', detail: '"Vintage Üç Kişilik Kadife Koltuk" ilanı vitrine alındı.', createdAt: ago(3) },
]

export interface SeedData {
  users: User[]
  categories: Category[]
  products: Product[]
  favorites: Favorite[]
  follows: Follow[]
  messages: Message[]
  adminLogs: AdminLog[]
}

/** Demo veri setini üretir. Parola özetleri asenkron hesaplandığı için Promise döner. */
export async function createSeedData(): Promise<SeedData> {
  const users: User[] = await Promise.all(
    USER_SPECS.map(async (spec) => ({
      id: spec.id,
      email: spec.email,
      passwordHash: await hashPassword(spec.password),
      firstName: spec.firstName,
      lastName: spec.lastName,
      role: spec.role,
      address: spec.city,
      bio: spec.bio,
      avatar: `https://picsum.photos/seed/${spec.id}/200/200`,
      createdAt: ago(150),
    })),
  )

  return {
    users,
    categories: CATEGORIES,
    products: PRODUCTS,
    favorites: FAVORITES,
    follows: FOLLOWS,
    messages: MESSAGES,
    adminLogs: ADMIN_LOGS,
  }
}
