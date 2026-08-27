# Folio — гар утасны апп

`frontend/` (React + Vite) вебийн гар утасны хувилбар. Ижил Laravel API-г
дууддаг — өөр **платформ** болохоос өөр төсөл биш.

> `mobile/` нь **docker-compose-д ОРДОГГҮЙ**. Expo нь QR код, USB, Metro
> сервер зэргийг хостоос шаарддаг. Эхлээд `docker compose up`, дараа нь
> тусад нь `npx expo start`.

---

## 1. Асаах

```bash
# 1. Backend + DB + queue-г асаана (repo-гийн үндсэн хавтаст)
docker compose up

# 2. Утасны аппыг асаана (энэ хавтаст)
cd mobile
npx expo start
```

Дараа нь утсан дээрээ **Expo Go** аппаар QR кодыг уншуулна.

---

## 2. ХАМГИЙН ТҮГЭЭМЭЛ АСУУДАЛ: "Сервертэй холбогдож чадсангүй"

Утсан дээр `localhost` гэдэг нь **утас өөрөө** гэсэн үг, таны компьютер биш.
Тиймээс `mobile/.env` дотор компьютерийн жинхэнэ сүлжээний хаяг байх ёстой:

```
EXPO_PUBLIC_API_URL=http://192.168.1.6:8000/api
```

Хаягаа олох:

```powershell
Get-NetIPAddress -AddressFamily IPv4
```

Wi-Fi адаптерийн хаягийг ав (`192.168.…` эсвэл `10.…`).

| Хаана ажиллуулж байна | Ямар хаяг |
| --- | --- |
| Жинхэнэ утас (Expo Go) | компьютерийн LAN IP |
| Android emulator | `http://10.0.2.2:8000/api` |
| iOS simulator / веб | `http://localhost:8000/api` |
| USB-ээр холбосон Android | `adb reverse tcp:8000 tcp:8000` → `localhost` |

**`.env` зассаны дараа Expo-г ДАХИН АСААНА:**

```bash
npx expo start -c
```

`EXPO_PUBLIC_*` хувьсагчийг Metro нь bundle хийх үедээ кодод шууд бичдэг тул
зүгээр reload дарахад хуучин утга үлдэнэ.

### Хаяг зөв мөртлөө холбогдохгүй бол

1. Утас, компьютер хоёр **ижил Wi-Fi**-д байгаа эсэх.
2. **Windows Firewall** 8000 портыг гаднаас хааж байж болзошгүй —
   компьютер дээрээ `http://localhost:8000/api/books` ажиллаж байхад
   утсан дээр ажиллахгүй бол ихэвчлэн энэ шалтгаан.
3. `docker compose ps` — backend `healthy` эсэх.

> CORS-ийн тухай санаа зовох хэрэггүй: React Native нь хөтөч биш тул
> CORS дүрэм үйлчлэхгүй.

---

## 3. Бүтэц

```
app/                    ← маршрут бүр = файл (expo-router)
  _layout.tsx           App.jsx-ийн <Routes> — дэлгэц бүрийн гарчиг/өнгө
  index.tsx             Catalog.jsx        →  /
  books/[id].tsx        BookDetail.jsx     →  /books/42
  cart.tsx              Cart.jsx           →  /cart
  signin.tsx            SignIn.jsx
  register.tsx          Register.jsx
  email-verified.tsx    EmailVerified.jsx
  +not-found.tsx        NotFound.jsx       →  path="*"

api/
  client.ts             axios + expo-secure-store (localStorage-ийн оронд)
  books.ts              normalizeBook, зээлэх туслах функцууд

context/
  auth.tsx              App.jsx дахь user/handleAuth/handleLogout энд нүүсэн

components/             BookCard, BookCover, FilterChips, SearchBox, ui…
constants/theme.ts      index.css дэх :root токенуудын хуулбар
```

`app-example/` — Expo-гийн анхны жишээ код. Ашиглагдахгүй, git-д ч ордоггүй.
Хэрэггүй болвол устгаж болно.

---

## 4. Шалгах

```bash
npx tsc --noEmit                       # төрлийн алдаа
npx expo lint                          # eslint
npx expo export --platform android     # bundle бүтэн эсэх
```
