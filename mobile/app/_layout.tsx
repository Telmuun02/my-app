/**
 * ===== Үндсэн layout =====
 *
 * frontend/src/App.jsx-ийн хувилбар. Гэхдээ ГОЛ САНАА нь өөр:
 *
 * ВЕБ ДЭЭР маршрутыг ГАРААР бичдэг байсан:
 *     <Route path="/books/:id" element={<BookDetail user={user} />} />
 *
 * ЭНД маршрут нь ФАЙЛЫН БАЙРШЛААР өөрөө үүснэ (expo-router):
 *     app/index.tsx        →  /
 *     app/books/[id].tsx   →  /books/42        ← [id] нь :id-ийн орлуулагч
 *     app/cart.tsx         →  /cart
 *     app/signin.tsx       →  /signin
 *     app/+not-found.tsx   →  дээрхийн аль нь ч таарахгүй бүх хаяг
 *
 * Тиймээс энэ файлд <Route> байхгүй — зөвхөн дэлгэц бүрийн ГАРЧИГ, ӨНГӨ.
 *
 * Мөн App.jsx дахь user/handleAuth/handleLogout нь бүгд AuthProvider руу нүүсэн
 * (context/auth.tsx-ийн тайлбарыг уншина уу). Учир нь эндээс дэлгэц рүү prop
 * дамжуулах боломж байхгүй — дэлгэцүүдийг router өөрөө render хийдэг.
 */

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth';

/**
 * Хадгалсан сессийг уншиж дуустал splash дэлгэцийг барина.
 *
 * Үүнгүй бол апп асахад нэвтэрсэн хэрэглэгч хормын зуур "Нэвтэрнэ үү" дэлгэцийг
 * хараад, дараа нь каталог руу үсэрнэ. Тэр анивчилт нь эвдэрсэн юм шиг харагдана.
 */
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // SafeAreaProvider — "цухуйсан" хэсэг (notch, доод зураас) хаана дуусахыг
    // хэмждэг. Дэлгэцүүд үүнийг useSafeAreaInsets()-ээр уншина.
    <SafeAreaProvider>
      <AuthProvider>
        <SplashGate />
        <RootStack />
      </AuthProvider>
      {/* Дэвсгэр цайвар тул статус мөрийн бичиг БАРААН байх ёстой. */}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

/** Сесс уншиж дуусмагц splash-ыг нуухаас өөр юу ч хийхгүй. */
function SplashGate() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return null;
}

function RootStack() {
  return (
    <Stack
      // screenOptions — БҮХ дэлгэцэд хамаарах өгөгдмөл утга.
      // Веб дээр энэ нь index.css дэх өнгөний токенууд байсан.
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.text, // буцах сум + гарчгийн өнгө
        headerTitleStyle: { fontWeight: '700' },
        // headerShadowVisible: false — доод зураасыг арилгана. Folio-гийн
        // дэвсгэр нь толгой ба агуулгад ижил тул зураас нь илүүц зааг үүсгэнэ.
        headerShadowVisible: false,
        // Дэлгэц бүрийн дэвсгэр. Үүнгүй бол цагаан (эсвэл харанхуй горимд хар)
        // үлдэж, Folio-гийн шаргал өнгө зөвхөн агуулгын доор харагдана.
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Folio' }} />
      <Stack.Screen name="books/[id]" options={{ title: 'Дэлгэрэнгүй' }} />
      <Stack.Screen name="cart" options={{ title: 'Миний зээл' }} />
      <Stack.Screen name="signin" options={{ title: 'Нэвтрэх' }} />
      <Stack.Screen name="register" options={{ title: 'Бүртгүүлэх' }} />
      <Stack.Screen name="email-verified" options={{ title: 'Баталгаажуулалт' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Олдсонгүй' }} />
    </Stack>
  );
}
