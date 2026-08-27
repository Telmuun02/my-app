/**
 * ===== Нэвтрэлтийн context =====
 *
 * ЭНЭ БОЛ ВЕБ ХУВИЛБАРААС ХАМГИЙН ИХ ЗӨРСӨН ХЭСЭГ. Учрыг нь ойлгох нь чухал.
 *
 * Веб дээр App.jsx-д ийм байсан:
 *
 *     function loadStoredUser() {
 *       const raw = localStorage.getItem("folio_user");   // ← ШУУД буцаана
 *       return raw ? JSON.parse(raw) : null;
 *     }
 *     const [user, setUser] = useState(loadStoredUser);   // ← эхний render-т бэлэн
 *
 * Утсан дээр SecureStore нь ASYNC тул `useState(loadStoredUser)` гэж БИЧИХ
 * БОЛОМЖГҮЙ — useState нь Promise-ыг хүлээж чаддаггүй, Promise объектыг өөрийг
 * нь хэрэглэгч гэж хадгалчихна.
 *
 * Тиймээс төлөв нь ХОЁР биш ГУРАВ болно:
 *
 *     loading = true             → хараахан мэдэхгүй байна (Keychain уншиж байна)
 *     loading = false, user = X  → нэвтэрсэн
 *     loading = false, user = null → нэвтрээгүй
 *
 * Дунд төлөвийг мартвал апп асах бүрд нэвтэрсэн хэрэглэгч хормын зуур
 * "нэвтрээгүй" мэт харагдаад, Catalog нь "Нэвтэрнэ үү" дэлгэцийг анивчуулна.
 *
 * ЯАГААД CONTEXT, PROP БИШ ВЭ:
 * Веб дээр App.jsx нь бүх хуудсыг өөрөө render хийдэг тул `user`-ыг prop-оор
 * дамжуулж чаддаг байсан. expo-router-т дэлгэцүүдийг ФАЙЛЫН БАЙРШЛААР нь
 * router өөрөө render хийдэг — бидэнд <Catalog user={user} /> гэж бичих газар
 * байхгүй. Context нь props-ын оронд орно.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import client, {
  clearStoredUser,
  clearToken,
  loadStoredUser,
  loadToken,
  saveStoredUser,
  saveToken,
  type User,
} from '@/api/client';

type AuthValue = {
  /** Нэвтэрсэн хэрэглэгч, эсвэл null. */
  user: User | null;
  /** true бол хадгалсан сесс хараахан уншиж дуусаагүй. */
  loading: boolean;
  /** SignIn амжилттай болоход дуудагдана. */
  signIn: (data: { user: User; token: string }) => Promise<void>;
  /** Гарах. */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Апп асахад НЭГ УДАА: хадгалсан токен + хэрэглэгчийг сэргээнэ.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // Хоёуланг нь ЗЭРЭГ уншина. Дараалуулбал хоёр дахин удаан болно —
        // хоорондоо хамааралгүй тул хүлээх шаардлагагүй.
        const [token, storedUser] = await Promise.all([loadToken(), loadStoredUser()]);

        // Аль нэг нь дутуу бол нэвтрээгүйд тооцно. Жишээ нь токен устсан
        // мөртлөө хэрэглэгч үлдсэн бол бүх хүсэлт 401 авах болно.
        if (active && token && storedUser) setUser(storedUser);
      } finally {
        // Алдаа гарсан ч loading-ийг заавал унтраана — эс бөгөөс апп
        // мөнхийн "ачаалж байна" дэлгэц дээр гацна.
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,

      async signIn({ user: nextUser, token }) {
        // Эхлээд хадгална, дараа нь state-ээ өөрчилнө. Эсрэгээр хийвэл
        // дэлгэц шинэчлэгдчихээд, хадгалалт нь амжилтгүй болох магадлалтай.
        await Promise.all([saveToken(token), saveStoredUser(nextUser)]);
        setUser(nextUser);
      },

      async signOut() {
        try {
          await client.post('/logout');
        } catch {
          // Токен аль хэдийн хүчингүй байсан ч локалаас цэвэрлэхэд асуудалгүй.
        }
        await Promise.all([clearToken(), clearStoredUser()]);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Дэлгэцүүд ингэж уншина:  const { user, signOut } = useAuth();
 *
 * AuthProvider-ийн ГАДНА дуудвал context нь null ирнэ. Тэр үед
 * `user.name` гэхэд ойлгомжгүй алдаа өгөхийн оронд шалтгааныг нь шууд хэлье.
 */
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth-ыг <AuthProvider> дотор ашиглана уу (app/_layout.tsx).');
  }
  return ctx;
}
