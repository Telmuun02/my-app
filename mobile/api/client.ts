/**
 * ===== API клиент (mobile) =====
 *
 * frontend/src/api/client.js-ийн хувилбар. ХОЁР ЗҮЙЛ ӨӨР:
 *
 * 1. localStorage БАЙХГҮЙ.
 *    Веб дээр localStorage.getItem() нь утгыг ШУУД буцаадаг (синхрон).
 *    Утсан дээр түүний оронд expo-secure-store — энэ нь iOS Keychain /
 *    Android Keystore руу ханддаг тул бүх үйлдэл ASYNC (Promise буцаана).
 *    Яагаад тэр нь чухал вэ гэдгийг доорх memoryToken-оос уншина уу.
 *
 * 2. import.meta.env БАЙХГҮЙ.
 *    Vite-ийн import.meta.env.VITE_API_URL → Expo дээр process.env.EXPO_PUBLIC_*.
 *    Metro нь bundle хийхдээ энэ утгыг кодод шууд бичиж оруулна.
 */

// axios нь `axios.create(...)` гэсэн default экспортоос гадна ЯГ ижил
// функцуудыг НЭРТЭЙ ч экспортолдог. Нэртэйг нь ашигласан шалтгаан: bundler нь
// ашиглаагүй хэсгийг таслаж чадна (tree-shaking) — аппын хэмжээ бага зэрэг
// багасна. Гар утсан дээр bundle-ийн хэмжээ нь эхний ачаалах хугацаа.
import { create as createAxios, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'folio_token';
const USER_KEY = 'folio_user';

/**
 * Токеныг санах ойд БАС хадгална.
 *
 * Яагаад: доорх interceptor нь хүсэлт БҮРД ажилладаг. Хэрэв тэнд бүрд нь
 * SecureStore.getItemAsync() дуудвал хүсэлт бүр Keychain руу очиж, нэмэлт
 * саатал үүсгэнэ. Оронд нь аппыг асаах үед НЭГ УДАА уншаад энд барина —
 * ингэснээр interceptor нь веб дээрхтэй адил СИНХРОН хэвээр үлдэнэ.
 *
 * SecureStore нь "жинхэнэ" эх сурвалж (апп хаагдсан ч үлдэнэ), энэ хувьсагч нь
 * зөвхөн хурдан кэш. Хоёулаа ҮРГЭЛЖ хамт шинэчлэгдэнэ.
 */
let memoryToken: string | null = null;

/** Backend-ээс ирдэг хэрэглэгчийн хэлбэр (Header, Catalog, Cart ашиглана). */
export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member' | string;
  company?: { id: number; name: string } | null;
};

// ---------------------------------------------------------------- token -----

/** Апп асахад SecureStore-оос сэргээнэ. AuthProvider ганц удаа дуудна. */
export async function loadToken(): Promise<string | null> {
  memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memoryToken;
}

/** Нэвтэрсний дараа: кэш + байнгын хадгалалт хоёуланг нь бичнэ. */
export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** Гарах үед: хоёуланг нь цэвэрлэнэ. */
export async function clearToken(): Promise<void> {
  memoryToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ----------------------------------------------------------------- user -----
// Хэрэглэгчийн мэдээлэл нууц биш ч, токентой хамт нэг газар байвал
// "нэвтэрсэн эсэх" төлөв нь нэг л эх сурвалжтай болно.

export async function loadStoredUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;

  // Хадгалсан JSON эвдэрсэн байвал (хувилбар солигдох гэх мэт) апп
  // асахдаа унахын оронд "нэвтрээгүй" гэж үзнэ.
  try {
    return JSON.parse(raw) as User;
  } catch {
    await SecureStore.deleteItemAsync(USER_KEY);
    return null;
  }
}

export async function saveStoredUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

// --------------------------------------------------------------- client -----

const baseURL = process.env.EXPO_PUBLIC_API_URL;

// Хаяг тохируулаагүй бол хүсэлт бүр ойлгомжгүй алдаагаар унана. Эрт хэлье.
if (!baseURL) {
  console.warn(
    'EXPO_PUBLIC_API_URL тохируулаагүй байна. mobile/.env файлыг шалгаад ' +
      'Expo-г дахин асаана уу (npx expo start -c).'
  );
}

const client = createAxios({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  /**
   * Утасны сүлжээ компьютерийнхээс тогтворгүй. Хугацааны хязгааргүй бол
   * буруу IP бичсэн үед дэлгэц "Loading…" дээр мөнхөд өлгөгдөнө.
   * 15 секундын дараа алдаа өгвөл хэрэглэгч ядаж юу болсныг мэднэ.
   */
  timeout: 15000,
});

// Веб хувилбартай адил: токен байвал Authorization толгой залгана.
client.interceptors.request.use((config) => {
  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return config;
});

export default client;

/**
 * Алдааны мессежийг НЭГ газраас гаргана.
 *
 * Веб дээр `err.response?.data?.message ?? "..."` гэсэн мөр 6 файлд давтагдаж
 * байсан. Утсан дээр нэмэлт тохиолдол бий: сүлжээ огт байхгүй, эсвэл .env дэх
 * IP буруу — тэр үед err.response нь undefined байна (сервер хариу огт өгөөгүй).
 * Тэр тохиолдолд "Backend асаалттай юу?" гэхээс илүү тодорхой зөвлөгөө хэрэгтэй.
 */
export function apiError(err: unknown, fallback = 'Алдаа гарлаа.'): string {
  if (isAxiosError(err)) {
    // Сервер хариулсан — Laravel-ийн мессежийг харуулна.
    if (err.response) {
      if (err.response.status === 401) {
        return 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.';
      }
      return (err.response.data as { message?: string })?.message ?? fallback;
    }

    // Сервер хариулаагүй — хаяг/сүлжээний асуудал.
    return (
      'Сервертэй холбогдож чадсангүй.\n\n' +
      `Хаяг: ${baseURL ?? '(тохируулаагүй)'}\n` +
      'Утас, компьютер хоёр ижил Wi-Fi-д байгаа эсэх, docker compose асаалттай ' +
      'эсэхийг шалгаад mobile/.env доторх IP-г шинэчилнэ үү.'
    );
  }

  return fallback;
}
