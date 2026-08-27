/**
 * ===== Толгой дээрх үйлдлүүд =====
 *
 * frontend/src/components/Header.jsx-ийн ҮЛДСЭН хэсэг.
 *
 * Header.jsx-д ГУРВАН зүйл байсан:
 *   1. лого + "Folio" нэр   → одоо stack-ийн ГАРЧИГ (app/_layout.tsx)
 *   2. хайлтын талбар       → одоо каталог дэлгэцийн ДОТОР (app/index.tsx)
 *   3. сагс + нэвтрэх/гарах → ЭНЭ ФАЙЛ
 *
 * Яагаад хайлт нүүсэн бэ: веб дээр header нь бүх хуудсанд харагддаг тул хайлт
 * ч бүх хуудсанд байсан бөгөөд Header.jsx нь "өөр хуудсан дээр бичиж эхэлбэл
 * каталог руу буцаана" гэсэн заль хийх шаардлагатай болсон. Утасны толгой мөр
 * маш нарийн — хайлтын талбар багтахгүй. Хайлтыг зөвхөн каталог дээр
 * байрлуулснаар тэр заль ч хэрэггүй боллоо.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export function HeaderActions({ cartCount = 0 }: { cartCount?: number }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  /**
   * Гарахын өмнө асууна.
   *
   * Веб дээр "Sign out" нь шууд ажилладаг — андуурч дарсан ч дахин нэвтрэх нь
   * хялбар. Утсан дээр товчнууд ойрхон бөгөөд хуруу нь хулганаас том тул
   * санамсаргүй дарах магадлал өндөр. Дээр нь дахин нэвтрэх нь утасны гараар
   * и-мэйл, нууц үг бичнэ гэсэн үг — тэр нь мэдэгдэхүйц төвөгтэй.
   */
  const confirmSignOut = () => {
    Alert.alert('Гарах уу?', 'Дахин нэвтрэхийн тулд и-мэйл, нууц үгээ оруулна.', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Гарах',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          // Гарсны дараа каталог руу. replace — түүхийг СОЛИНО, ингэснээр
          // "буцах" дарахад нэвтэрсэн үеийн дэлгэц рүү эргэж орохгүй.
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={s.wrap}>
      {/* Сагс = "миний зээлсэн номууд". Link ашигласан нь Pressable + router.push
          гэхээс дээр: expo-router нь үүнийг веб дээр жинхэнэ <a> болгож зурдаг
          тул апп нь веб хувилбартайгаа нэг кодоор ажиллана. */}
      <Link href="/cart" asChild>
        <Pressable hitSlop={8} accessibilityLabel={`Миний зээл (${cartCount})`}>
          <View>
            <Ionicons name="cart-outline" size={24} color={Colors.text} />
            {/* 0 үед тоо харуулахгүй (веб хувилбартай ижил дүрэм). */}
            {cartCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Link>

      {user ? (
        <Pressable onPress={confirmSignOut} hitSlop={8} accessibilityLabel="Гарах">
          <Ionicons name="log-out-outline" size={24} color={Colors.text} />
        </Pressable>
      ) : (
        <Link href="/signin" asChild>
          <Pressable hitSlop={8} accessibilityRole="link">
            <Text style={s.signIn}>Нэвтрэх</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  signIn: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
});
