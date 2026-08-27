/**
 * ===== Одон үнэлгээ =====
 *
 * frontend/src/components/BasicRating.jsx-ийн хувилбар.
 *
 * ЯАГААД ГАРААР БИЧСЭН БЭ: веб дээр энэ нь MUI-ийн <Rating>. MUI бол ХӨТӨЧИЙН
 * сан — DOM элемент, CSS класс дээр суурилдаг тул React Native дээр огт
 * ажиллахгүй. Утсан дээр MUI-ийн орлуулагч байхгүй тул 5 товчийг өөрсдөө зурав.
 *
 * MUI-гээс АЛДАЖ БУЙ ЗҮЙЛ, түүнийг хэрхэн нөхөв:
 *   - гарын (keyboard) дэмжлэг → утсанд хамаагүй
 *   - hover эффект            → утсанд хулгана байхгүй
 *   - radio семантик          → accessibilityRole + accessibilityState-ээр өгөв
 *
 * АНХААР: backend-д одоогоор үнэлгээний endpoint БАЙХГҮЙ. Тиймээс энэ нь
 * зөвхөн локал төлөв — хуудас сэргээхэд алга болно (веб хувилбартай ижил).
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const STARS = [1, 2, 3, 4, 5];

export function Rating({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label?: string;
  value: number | null;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
}) {
  return (
    <View style={s.wrap}>
      {label && <Text style={s.label}>{label}</Text>}

      <View style={s.stars}>
        {STARS.map((n) => {
          const filled = value != null && n <= value;

          return (
            <Pressable
              key={n}
              disabled={readOnly}
              // MUI-тэй ижил зан: сонгогдсон од дээр ДАХИН дарвал үнэлгээ арилна.
              onPress={() => onChange?.(value === n ? null : n)}
              hitSlop={4}
              accessibilityRole="radio"
              accessibilityState={{ selected: filled, disabled: readOnly }}
              accessibilityLabel={`${n} од`}
            >
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={24}
                // MUI-ийн анхдагч шар өнгө (#faaf00) — тэмдэглэгээг таних
                // мэдрэмжийг хадгална.
                color={filled ? '#faaf00' : Colors.textMuted}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={s.value}>{value ? `${value} / 5` : 'Үнэлгээгүй'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text },
  stars: { flexDirection: 'row', gap: 2 },
  value: { fontSize: 13, color: Colors.textMuted },
});
