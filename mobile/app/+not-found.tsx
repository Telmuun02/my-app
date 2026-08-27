/**
 * ===== Олдсонгүй =====
 *
 * frontend/src/pages/NotFound.jsx-ийн хувилбар.
 *
 * Веб дээр энэ нь `<Route path="*">` байсан. expo-router-т файлын нэрний
 * `+` угтвар нь "энэ бол ердийн зам биш, ТУСГАЙ файл" гэсэн утгатай —
 * `+not-found` нь бүртгэгдсэн аль ч замд таарахгүй хаягийг барьж авна.
 *
 * Утсан дээр хэрэглэгч хаягийг гараар бичдэггүй тул энэ дэлгэц ховор гарна.
 * Гэхдээ deep link (mobile://...) буруу ирвэл, эсвэл устсан ном руу заасан
 * хуучин холбоос дарагдвал энд ирнэ.
 */

import { StyleSheet, Text, View } from 'react-native';

import { EmptyState, PrimaryLink } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={s.page}>
      <Text style={s.code}>404</Text>
      <EmptyState>Ийм хуудас байхгүй байна.</EmptyState>
      <PrimaryLink href="/" title="← Каталог руу буцах" />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  code: { fontSize: 64, fontWeight: '700', color: Colors.text, letterSpacing: -2 },
});
