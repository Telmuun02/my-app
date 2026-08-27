/**
 * ===== ДУНДЫН давхарга =====
 *
 * frontend/src/App.css-ийн хувилбар: хоёр ба түүнээс дээш дэлгэцэд давтагдсан
 * бүх загвар энд НЭГ л удаа тодорхойлогдоно.
 *
 * Веб дээр энэ нь CSS класс байсан:   <span className="pill pill--avail">
 * Энд компонент болно:                <Pill tone="avail">
 *
 * ЯАГААД КЛАСС БИШ КОМПОНЕНТ ВЭ: React Native-д CSS файл, класс, каскад
 * (cascade) байхгүй. Загвар нь ердөө объект бөгөөд `style={[a, b]}` гэж
 * массивлаж давхарлана — сүүлийнх нь ялна. Тиймээс "base + modifier" загварыг
 * компонентын prop-оор илэрхийлэх нь хамгийн ойр хувилбар.
 */

import { Link, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors, Font, Radius, Shadow } from '@/constants/theme';

// =============================================================== Pill =======
// Боломжийн шошго — BookCard, BookDetail, Cart гурвуулаа ашиглана.
// Веб дээр: .pill / .pill--avail / .pill--out / .pill--late

type PillTone = 'avail' | 'out' | 'late';

export function Pill({ tone, children }: { tone: PillTone; children: string }) {
  return (
    <View style={[s.pill, s[`pill_${tone}`]]}>
      <Text style={[s.pillText, s[`pillText_${tone}`]]}>{children}</Text>
    </View>
  );
}

// ============================================================== Badge =======
// Веб дээр: .badge-outline (хүрээтэй ангилал) ба .badge-company (дүүргэсэн).

export function BadgeOutline({ children }: { children: string }) {
  return (
    <View style={s.badgeOutline}>
      <Text style={s.badgeOutlineText}>{children}</Text>
    </View>
  );
}

export function BadgeCompany({ children }: { children: string }) {
  return (
    <View style={s.badgeCompany}>
      <Text style={s.badgeCompanyText}>{children}</Text>
    </View>
  );
}

/** Шошгуудын мөр — багтахгүй бол доош дамжина (.tag-row). */
export function TagRow({ children }: { children: React.ReactNode }) {
  return <View style={s.tagRow}>{children}</View>;
}

// ============================================================ Товчнууд ======

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  /** true бол доторх текстийн оронд эргэлдэгч (spinner) харагдана. */
  busy?: boolean;
  /** Бүтэн өргөн (.btn-block). */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Ногоон үндсэн товч (.btn-primary).
 *
 * Веб дээр :hover байсан бол утсан дээр хулгана байхгүй тул түүний оронд
 * PRESSED төлөв: хуруу дарж байх үед бараан болно. Pressable нь энэ төлөвийг
 * style функцээр өгдөг.
 */
export function PrimaryButton({ title, onPress, disabled, busy, block, style }: ButtonProps) {
  const off = disabled || busy;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btnPrimary,
        block && s.btnBlock,
        pressed && !off && s.btnPrimaryPressed,
        off && s.btnDisabled,
        style,
      ]}
      // Дэлгэц уншигчид "товч" гэдгийг нь хэлнэ (веб дээр <button> өөрөө хэлдэг).
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off }}
    >
      {busy ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={s.btnPrimaryText}>{title}</Text>
      )}
    </Pressable>
  );
}

/** Дэвсгэргүй энгийн текст товч (.btn-text). */
export function TextButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8}>
      {({ pressed }) => (
        <Text style={[s.btnText, pressed && s.btnTextPressed, style]}>{title}</Text>
      )}
    </Pressable>
  );
}

/**
 * Товч шиг харагддаг ХОЛБООС (веб дээрх `<Link className="btn-primary">`).
 *
 * asChild — Link-д "өөрөө <Text> бүү зур, доторх хүүхдээ ашигла" гэж хэлнэ.
 * Үүнгүй бол Link нь товчийг <Text> дотор боож, байрлал эвдэрнэ.
 */
export function PrimaryLink({
  href,
  title,
  block,
  replace,
}: {
  href: Href;
  title: string;
  block?: boolean;
  replace?: boolean;
}) {
  return (
    <Link href={href} replace={replace} asChild>
      <Pressable
        style={({ pressed }) => [s.btnPrimary, block && s.btnBlock, pressed && s.btnPrimaryPressed]}
        accessibilityRole="link"
      >
        <Text style={s.btnPrimaryText}>{title}</Text>
      </Pressable>
    </Link>
  );
}

/** "← Каталог руу буцах" маягийн холбоос (.back-link). */
export function BackLink({ href = '/', label = '← Каталог руу буцах' }: { href?: Href; label?: string }) {
  return (
    <Link href={href} style={s.backLink}>
      {label}
    </Link>
  );
}

/** Доод талын жижиг холбоос — "Бүртгэлгүй юу? Register" (.auth__link). */
export function InlineLink({ href, title }: { href: Href; title: string }) {
  return (
    <Link href={href} style={s.inlineLink}>
      {title}
    </Link>
  );
}

// ====================================================== Текст блокууд =======

/** Хуудасны үндсэн гарчиг (.page__title). */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.pageTitle}>{children}</Text>;
}

/** Ачаалж буй / хоосон / алдааны мөр (.empty-state). */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <Text style={s.emptyState}>{children}</Text>;
}

/** Ногоон эсвэл улаан мэдэгдлийн хайрцаг (.notice-ok / .notice-err). */
export function Notice({ tone, children }: { tone: 'ok' | 'err'; children: React.ReactNode }) {
  return (
    <View style={[s.notice, tone === 'ok' ? s.noticeOk : s.noticeErr]}>
      <Text style={[s.noticeText, tone === 'ok' ? s.noticeOkText : s.noticeErrText]}>
        {children}
      </Text>
    </View>
  );
}

// ============================================================== Форм ========

/**
 * Нэр + оролтын талбар (.field).
 *
 * Веб дээр <label> нь оролтыг АВТОМАТААР дагуулдаг (дарахад фокус очно).
 * RN-д <label> байхгүй тул тэр холбоог accessibilityLabel-ээр гараар өгнө.
 */
export function Field({
  label,
  ...inputProps
}: { label: string } & TextInputProps) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.input}
        placeholderTextColor={Colors.textMuted}
        accessibilityLabel={label}
        {...inputProps}
      />
    </View>
  );
}

// ============================================================ Загварууд =====

const s = StyleSheet.create({
  // ----- pill -----
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    // alignSelf: 'flex-start' — эс бөгөөс pill нь эцгийнхээ бүтэн өргөнийг эзэлнэ.
    // Вебийн inline элемент нь агуулгынхаа хэрээр өргөсдөг; RN-ий View нь
    // flex контейнер тул анхдагчаар сунадаг.
    alignSelf: 'flex-start',
  },
  pill_avail: { backgroundColor: Colors.availBg },
  pill_out: { backgroundColor: Colors.surfaceMuted },
  pill_late: { backgroundColor: Colors.errBg },

  pillText: { fontSize: 13, fontWeight: '600' },
  pillText_avail: { color: Colors.availText },
  pillText_out: { color: Colors.textMuted },
  pillText_late: { color: Colors.errText },

  // ----- badge -----
  badgeOutline: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  badgeOutlineText: { fontSize: 12, color: Colors.textMuted },

  badgeCompany: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.activeBg,
    alignSelf: 'flex-start',
  },
  badgeCompanyText: { fontSize: 12, fontWeight: '600', color: Colors.text },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // ----- товч -----
  btnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    // Spinner гарч ирэхэд товчийн өндөр үсрэхээс сэргийлнэ.
    minHeight: 42,
  },
  btnPrimaryPressed: { backgroundColor: Colors.primaryHover },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  btnBlock: { alignSelf: 'stretch', paddingVertical: 13 },
  btnDisabled: { opacity: 0.5 },

  btnText: { fontSize: 15, color: Colors.text, paddingVertical: 8, paddingHorizontal: 4 },
  btnTextPressed: { color: Colors.primary },

  backLink: { marginBottom: 24, fontSize: 15, color: Colors.textMuted },
  inlineLink: { fontSize: 15, fontWeight: '700', color: Colors.primary },

  // ----- текст -----
  pageTitle: { marginTop: 12, fontSize: 30, lineHeight: 34, fontWeight: '700', color: Colors.text },
  emptyState: { color: Colors.textMuted, paddingVertical: 40, lineHeight: 21 },

  notice: { padding: 14, borderRadius: Radius.md },
  noticeOk: { backgroundColor: Colors.availBg },
  noticeErr: { backgroundColor: Colors.errBg },
  noticeText: { fontSize: 14, lineHeight: 21 },
  noticeOkText: { color: Colors.availText },
  noticeErrText: { color: Colors.errText },

  // ----- форм -----
  field: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    fontSize: 15,
    color: Colors.text,
  },
});

/** Бусад файлд хэрэг болох дундын хэсгүүд. */
export const shared = StyleSheet.create({
  /** Карт/хайрцгийн сүүдэртэй цайвар гадаргуу. */
  surface: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    ...Shadow,
  },
  /** Моно фонттой жижиг дугаар (.loans__id). */
  monoSmall: { fontFamily: Font.mono, fontSize: 12, color: Colors.textMuted },
});
