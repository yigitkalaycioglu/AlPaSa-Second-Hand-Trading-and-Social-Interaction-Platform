# AlPaSa — İkinci El Alışveriş ve Sosyal Etkileşim Platformu

**Al, Pazarla, Sat.** Kullanmadığın eşyaları satışa çıkarabileceğin, aradığını uygun fiyata bulabileceğin ve satıcılarla doğrudan mesajlaşabileceğin modern bir ikinci el pazar yeri.

React 19 + TypeScript + Vite + Tailwind CSS v4 ile geliştirilmiş, **tamamen istemci taraflı** (backend'siz) tek sayfa uygulamasıdır. Tüm veriler tarayıcının `localStorage` alanında saklanır — kurulum, veritabanı veya sunucu gerektirmez.

<p align="center">
  <img src="docs/screenshots/01-anasayfa.png" alt="AlPaSa ana sayfa" width="880">
</p>

---

## İçindekiler

- [Canlı Demo](#canlı-demo)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Proje Yapısı](#proje-yapısı)
- [Mimari Notlar](#mimari-notlar)
- [Yayına Alma (Netlify)](#yayına-alma-netlify)
- [Bilinen Sınırlar](#bilinen-sınırlar)
- [Lisans](#lisans)

---

## Canlı Demo

| | |
|---|---|
| **Canlı sürüm** | https://alpasa.netlify.app/ |
| **Kaynak kod** | https://github.com/yigitkalaycioglu/AlPaSa-Second-Hand-Trading-and-Social-Interaction-Platform |

### Demo hesapları

Uygulama ilk açıldığında örnek verilerle (6 kullanıcı, 21 kategori, 21 ilan, mesajlaşma geçmişi) otomatik olarak doldurulur. Giriş ekranındaki kartlara tıklayarak tek hamlede giriş yapabilirsiniz:

| Rol | E-posta | Parola |
|---|---|---|
| Yönetici | `admin@alpasa.app` | `Admin123` |
| Kullanıcı | `demo@alpasa.app` | `Demo123` |

> Kendi hesabınızı da kayıt ekranından oluşturabilirsiniz. Profil sayfasındaki **"Verileri sıfırla"** düğmesi her şeyi başlangıç durumuna döndürür.

---

## Ekran Görüntüleri

| Ana sayfa | İlan listeleme |
|---|---|
| ![Ana sayfa](docs/screenshots/01-anasayfa.png) | ![İlan listesi](docs/screenshots/02-ilan-listesi.png) |

| İlan detayı | Yeni ilan (Ekleme) |
|---|---|
| ![İlan detayı](docs/screenshots/03-ilan-detay.png) | ![İlan ekleme](docs/screenshots/04-ilan-ekle.png) |

| İlanlarım (Güncelleme / Silme) | Mesajlaşma |
|---|---|
| ![İlanlarım](docs/screenshots/05-ilanlarim.png) | ![Mesajlar](docs/screenshots/06-mesajlar.png) |

| Yönetim paneli | Kategori yönetimi |
|---|---|
| ![Yönetim paneli](docs/screenshots/07-yonetim-paneli.png) | ![Kategori yönetimi](docs/screenshots/08-kategori-yonetimi.png) |

| Karanlık tema | Mobil görünüm |
|---|---|
| ![Karanlık tema](docs/screenshots/09-karanlik-tema.png) | <img src="docs/screenshots/10-mobil.png" alt="Mobil görünüm" width="260"> |

---

## Özellikler

### Temel CRUD işlemleri

| İşlem | Nerede | Açıklama |
|---|---|---|
| **Ekleme** | `/ilan/yeni` | Görsel yükleme, kategori seçimi ve alan doğrulamalı ilan formu |
| **Listeleme** | `/ilanlar` | Arama, iç içe kategori filtresi, fiyat/durum/şehir filtreleri, 6 sıralama seçeneği, sayfalama |
| **Güncelleme** | `/ilan/:id/duzenle` | Aynı form bileşeni; mevcut değerlerle dolu gelir, sahiplik kontrolü yapar |
| **Silme** | `/ilanlarim` ve ilan detayı | Onay penceresiyle korunur; ilana bağlı favori kayıtları da temizlenir |

### Kullanıcı özellikleri

- **Kimlik doğrulama** — kayıt, giriş, çıkış; parolalar SHA-256 ile özetlenerek saklanır (düz metin tutulmaz)
- **Rol bazlı yetkilendirme** — `Admin` ve `User` rolleri, korumalı rotalar
- **Favoriler** — tek tıkla favorileme, ayrı favoriler sayfası, favori sayacı
- **Mesajlaşma** — ilan üzerinden satıcıya mesaj, konuşma bazlı gelen kutusu, okunmadı rozeti
- **Satıcı takibi** — satıcı profilleri, takip et/bırak, takipçi sayıları
- **Profil yönetimi** — kişisel bilgiler, biyografi, parola değiştirme

### Yönetici özellikleri

- **Kontrol paneli** — platform istatistikleri, son ilanlar, en çok favorilenenler
- **Kategori yönetimi** — sınırsız derinlikte ağaç yapısında tam CRUD; döngü ve dolu kategori silme koruması
- **Kullanıcı yönetimi** — rol değiştirme, hesap silme (ilişkili tüm veriler dahil)
- **İşlem günlüğü** — yönetici eylemlerinin zaman çizelgesi

### Arayüz ve deneyim

- **Karanlık / aydınlık tema** — tercih `localStorage`'da saklanır, sayfa yüklenirken flash (FOUC) oluşmaz
- **Tam duyarlı tasarım** — mobil, tablet ve masaüstü
- **İç içe kategori ağacı** — akordiyon menü; ana kategori seçilince alt kategorilerdeki ilanlar da listelenir
- **Görsel işleme** — yüklenen fotoğraflar tarayıcıda otomatik küçültülür (canvas ile), depolama kotası korunur
- **Erişilebilirlik** — anlamlı `aria` etiketleri, klavye ile gezinme, belirgin odak halkaları, `prefers-reduced-motion` desteği
- **Bildirimler** — işlem sonuçları için toast bildirimleri; kota dolduğunda anlaşılır uyarı

---

## Teknoloji Yığını

| Katman | Seçim | Neden |
|---|---|---|
| Kütüphane | **React 19** | Bileşen tabanlı mimari, geniş ekosistem |
| Dil | **TypeScript 5.9** | `interfaces/` klasöründeki alan modelleriyle derleme zamanı güvencesi |
| Derleyici | **Vite 7** | Hızlı geliştirme sunucusu, optimize üretim çıktısı |
| Stil | **Tailwind CSS v4** | `@theme` ile tasarım belirteçleri, sıfır çalışma zamanı maliyeti |
| Yönlendirme | **React Router 7** | İç içe rotalar, rota koruyucuları |
| İkonlar | **lucide-react** | Ağaç sallamaya uygun, tutarlı ikon seti |
| Kalıcılık | **localStorage** | Backend gerektirmeden kalıcı veri |
| Yayın | **Netlify** | Git'e bağlı otomatik derleme ve dağıtım |

Üretim derlemesi: **~95 kB gzip JS + ~10 kB gzip CSS**.

---

## Hızlı Başlangıç

**Gereksinim:** Node.js 20 veya üzeri.

```bash
# 1. Depoyu klonlayın
git clone https://github.com/yigitkalaycioglu/AlPaSa-Second-Hand-Trading-and-Social-Interaction-Platform.git
cd AlPaSa-Second-Hand-Trading-and-Social-Interaction-Platform

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcıda **http://localhost:5173** adresini açın. Örnek veriler ilk açılışta otomatik yüklenir.

### Kullanılabilir komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (hot reload) |
| `npm run build` | Tip kontrolü + üretim derlemesi → `dist/` |
| `npm run preview` | Üretim çıktısını yerelde sunar |
| `npm run lint` | ESLint denetimi |
| `npm run typecheck` | Yalnızca TypeScript tip kontrolü |

---

## Proje Yapısı

```
AlPaSa/
├── docs/screenshots/          # README'de kullanılan ekran görüntüleri
├── public/                    # Statik dosyalar (logo, SPA yönlendirmesi)
├── src/
│   ├── components/            # Yeniden kullanılabilir bileşenler
│   │   ├── category/          #   CategoryTree, CategorySelect
│   │   ├── common/            #   Pagination, ThemeToggle, RouteGuards
│   │   ├── layout/            #   Navbar, Footer, AppLayout, Logo
│   │   ├── product/           #   ProductCard, FilterPanel, ImageUploader
│   │   └── ui/                #   Button, Field, Modal, Badge, Avatar…
│   ├── context/               # Durum yönetimi (Store, Auth, Theme, Toast)
│   ├── hooks/                 # useStore, useAuth, useTheme, useToast, useDebounce
│   ├── interfaces/            # TypeScript alan modelleri
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Social.ts          #   Favorite, Follow, Message, AdminLog
│   │   └── Ui.ts
│   ├── lib/                   # Saf yardımcı fonksiyonlar
│   │   ├── storage.ts         #   Tiplenmiş localStorage katmanı
│   │   ├── bootstrap.ts       #   Açılışta veri tohumlama
│   │   ├── seed.ts            #   Demo veri seti
│   │   ├── crypto.ts          #   Parola özetleme
│   │   ├── image.ts           #   Görsel küçültme
│   │   ├── categoryTree.ts    #   Özyinelemeli ağaç işlemleri
│   │   └── productFilters.ts  #   Filtreleme ve sıralama
│   ├── pages/                 # Rota bileşenleri
│   │   ├── admin/             #   Yönetici sayfaları
│   │   └── …
│   ├── App.tsx                # Sağlayıcılar + yönlendirme
│   └── main.tsx               # Giriş noktası
├── netlify.toml               # Netlify derleme ve yönlendirme yapılandırması
└── vite.config.ts
```

`components/`, `pages/` ve `interfaces/` klasörleri istenen dosya ağacı yapısına uygun olarak ayrılmıştır.

---

## Mimari Notlar

**Sağlayıcı sırası önemlidir.** `Theme → Toast → Store → Auth`: `Store` kota hatalarını bildirmek için `Toast`'a, `Auth` ise kullanıcı kayıtlarını okumak için `Store`'a bağımlıdır.

**Veri açılışta hazırlanır.** Demo verisinin tohumlanması parola özetleri için Web Crypto kullandığından asenkrondur. Bu işlem React ağacı monte edilmeden önce (`lib/bootstrap.ts`) bir kez çalıştırılır; böylece bileşenler `localStorage`'ı senkron okuyabilir, "yükleniyor" ara durumu ve effect kaynaklı zincirleme render'lar oluşmaz.

**Oturum senkron geri yüklenir.** Oturumu bir `useEffect` içinde geri yüklemek, ilk render'da korumalı rotaların kullanıcıyı giriş sayfasına yönlendirmesine yol açıyordu (korumalı bir sayfada F5'e basınca oturum düşüyordu). `AuthProvider` artık `localStorage`'ı doğrudan ilk state değeri olarak okur.

**Koleksiyonlar ayrı anahtarlarda tutulur.** Tek bir mesaj yazılırken tüm ilan listesinin (ve içindeki base64 görsellerin) yeniden serileştirilmemesi için her koleksiyon kendi `localStorage` anahtarında saklanır.

**Kota yönetimi.** Yüklenen görseller canvas üzerinde en fazla 1000 piksele küçültülüp JPEG olarak yeniden kodlanır (4 MB'lık bir fotoğraf ~100 KB'a iner). Kota dolarsa `StorageQuotaError` yakalanır, değişiklik geri alınır ve kullanıcı bilgilendirilir. `localStorage` tamamen kapalıysa (gizli sekme) uygulama bellek içi yedeğe düşer ve çalışmayı sürdürür.

**Kategori ağacı güvenliği.** Bir kategori kendi alt kategorisinin altına taşınamaz (`wouldCreateCycle`); alt kategorisi veya ilanı olan kategori silinemez. Ağaç gezinmesi döngüsel veriye karşı `Set` ile korunur.

---

## Yayına Alma (Netlify)

Depoda hazır `netlify.toml` bulunur; ek yapılandırma gerekmez.

1. [Netlify](https://app.netlify.com/) → **Add new site** → **Import an existing project**
2. GitHub deposunu seçin
3. Ayarlar otomatik okunur:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Deploy site**

`netlify.toml` ayrıca şunları yapar:
- SPA yönlendirmesi (`/*` → `/index.html`) — böylece `/ilanlar` gibi adresler doğrudan açıldığında 404 alınmaz
- Statik varlıklar için uzun süreli önbellek başlıkları
- Temel güvenlik başlıkları (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)

> Vercel, Cloudflare Pages veya GitHub Pages de kullanılabilir. Yalnızca SPA geri dönüş yönlendirmesinin tanımlı olduğundan emin olun.

---

## Bilinen Sınırlar

Bu proje bilinçli olarak backend'siz tasarlanmıştır. Bunun doğal sonuçları:

- **Veriler cihaza özeldir.** Farklı tarayıcı veya cihazdan girildiğinde aynı veriler görünmez; kullanıcılar birbirinin ilanlarını gerçek zamanlı göremez.
- **Kimlik doğrulama gerçek bir güvenlik sınırı değildir.** Parolalar SHA-256 ile özetlenir ancak istemci tarafı özetleme koruma sağlamaz — `localStorage`'ı okuyan herkes verilere erişebilir. Gerçek bir uygulamada parola doğrulaması sunucuda, bcrypt/argon2 gibi yavaş ve tuzlu bir algoritmayla yapılmalıdır.
- **Depolama kapasitesi ~5 MB'tır.** Görseller agresif biçimde küçültülse de yüklenebilecek ilan sayısı sınırlıdır.
- **Demo ilan görselleri uzak kaynaktan gelir.** Ağ erişimi yoksa, başlıktan türetilen degradeli SVG yer tutucular devreye girer.

Bir sonraki adım olarak bir REST API + PostgreSQL katmanı eklendiğinde `src/lib/storage.ts` arayüzü korunarak veri katmanı değiştirilebilir.

---

## Lisans

MIT — ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
