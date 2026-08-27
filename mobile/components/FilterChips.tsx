/**
 * ===== Шүүлтүүрийн чипс =====
 *
 * frontend/src/components/Sidebar.jsx-ийн хувилбар.
 *
 * Веб дээр энэ нь ЗҮҮН ТАЛЫН БАГАНА байсан — 200px өргөнтэй, номын жагсаалтын
 * хажууд байнга харагдана. Утсан дээр тийм багана байрлуулбал номын хэсэгт
 * ердөө 150px үлдэнэ. Тиймээс баганыг ХӨНДЛӨН гүйдэг чипсийн мөр болгов.
 *
 * Sidebar-ийн ХОЁР бүлэг (Category, Availability) хэвээрээ — зөвхөн босоо
 * жагсаалт байсныг нь хөндлөн ScrollView болгосон.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/** Sidebar.jsx дахь AVILABILITY массивтай яг ижил. */
const AVAILABILITY = [
  { value: 'all', label: 'Бүх ном' },
  { value: 'available', label: 'Боломжтой' },
  { value: 'checked-out', label: 'Зээлсэн' },
] as const;

type Props = {
  categories: string[];
  category: string;
  onCategory: (value: string) => void;
  availability: string;
  onAvailability: (value: string) => void;
};

export function FilterChips({
  categories,
  category,
  onCategory,
  availability,
  onAvailability,
}: Props) {
  return (
    <View style={s.wrap}>
      <ChipRow label="Ангилал">
        <Chip label="Бүгд" active={category === 'all'} onPress={() => onCategory('all')} />
        {categories.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => onCategory(c)} />
        ))}
      </ChipRow>

      <ChipRow label="Боломж">
        {AVAILABILITY.map((a) => (
          <Chip
            key={a.value}
            label={a.label}
            active={availability === a.value}
            onPress={() => onAvailability(a.value)}
          />
        ))}
      </ChipRow>
    </View>
  );
}

/** Sidebar.jsx дахь FilterGroup — гарчиг + доор нь хөндлөн гүйдэг мөр. */
function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <ScrollView
        horizontal
        // Хөндлөн гүйлгүүрийн зураас утсан дээр эвгүй харагддаг тул нуув.
        showsHorizontalScrollIndicator={false}
        // contentContainerStyle — ScrollView-ийн ДОТООД агуулгын загвар.
        // Энд gap/padding өгөх ёстой; гаднах `style`-д өгвөл ажиллахгүй.
        contentContainerStyle={s.rowContent}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** Sidebar.jsx дахь FilterItem. */
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.chip, active && s.chipActive, pressed && s.chipPressed]}
      accessibilityRole="button"
      // Дэлгэц уншигчид "энэ сонгогдсон байна" гэдгийг хэлнэ. Веб дээр
      // ялгаа нь зөвхөн ӨНГӨӨР илэрхийлэгддэг байсан — тэр нь хараагүй
      // хэрэглэгчид хүрдэггүй.
      accessibilityState={{ selected: active }}
    >
      <Text style={[s.chipText, active && s.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  row: { gap: 6 },
  rowLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  rowContent: { gap: 8, paddingRight: 16 },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.activeBg, borderColor: Colors.activeBg },
  chipPressed: { opacity: 0.6 },
  chipText: { fontSize: 13, color: Colors.textMuted },
  chipTextActive: { color: Colors.text, fontWeight: '700' },
});
