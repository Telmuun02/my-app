/**
 * ===== Хайлтын талбар =====
 *
 * frontend/src/App.css дахь `.search-box`-ийн хувилбар.
 *
 * ДҮРС ТЭМДЭГ (icon) хаанаас ирэв:
 * Веб дээр icons.jsx нь SVG-г гараар зурдаг. React Native нь SVG-г ойлгодоггүй
 * (react-native-svg гэсэн нэмэлт сан хэрэгтэй). Гэтэл Expo-гийн scaffold дотор
 * @expo/vector-icons аль хэдийн байгаа тул нэмэлт сан татахгүйгээр тэндээс
 * ижил төстэй дүрсийг авав.
 *
 * Веб дээрх байрлуулалт нь `position: absolute` + `translateY(-50%)` байсан.
 * Энд илүү энгийн: гадна нь flexDirection: 'row' хайрцаг, дотор нь дүрс ба
 * оролт зэрэгцээ. RN-д `translateY(-50%)` (хувиар) дэмжигддэггүй тул энэ нь
 * зөвхөн хялбар биш, зөв ч арга.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export function SearchBox({
  value,
  onChange,
  placeholder = 'Гарчиг эсвэл зохиогчоор хайх…',
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.box}>
      <Ionicons name="search" size={18} color={Colors.textMuted} />

      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        // Утасны гар нь өгөгдмөлөөр эхний үсгийг том болгож, "Dune"-ыг хайхад
        // "Dune" биш "DUne" болгож мэднэ. Хайлтад автомат засварыг унтраая.
        autoCapitalize="none"
        autoCorrect={false}
        // Гар дээр "хайх" товч гаргана (Enter-ийн оронд).
        returnKeyType="search"
        // iOS дээр талбарын баруун талд "x" цэвэрлэх товч гаргана.
        clearButtonMode="while-editing"
        accessibilityLabel="Ном хайх"
      />

      {/* Android-д clearButtonMode ажиллахгүй тул цэвэрлэх товчийг гараар
          нэмнэ. Утга байхгүй үед харуулах шаардлагагүй. */}
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityLabel="Хайлт цэвэрлэх">
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    // Веб дээр padding нь input дээр байсан. Энд өндрийг тогтоовол Android,
    // iOS хоёр дээр ижил харагдана (анхдагч өндөр нь платформоор ялгаатай).
    height: 46,
    fontSize: 15,
    color: Colors.text,
    // Android-ын TextInput нь өгөгдмөл дотоод зайтай — тэглэхгүй бол текст
    // яг голдоо байрлахгүй.
    paddingVertical: 0,
  },
});
