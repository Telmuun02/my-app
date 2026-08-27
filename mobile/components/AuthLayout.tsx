/**
 * ===== Нэвтрэх/бүртгүүлэх бүрхүүл =====
 *
 * frontend/src/components/AuthLayout.jsx + AuthLayout.css-ийн хувилбар.
 * SignIn, Register, EmailVerified гурвуулаа үүнийг ашиглана.
 *
 * УТСАН ДЭЭР НЭМЭГДСЭН ГОЛ ЗҮЙЛ — ГАР (keyboard).
 *
 * Веб дээр форм бөглөхөд юу ч хөдөлдөггүй. Утсан дээр талбар дээр дарангуут
 * дэлгэцийн доод ТАЛЫГ гар эзэлнэ. Юу ч хийхгүй бол:
 *   - "Нууц үг" талбар гарын АРД нуугдана,
 *   - "Sign in" товч огт харагдахгүй,
 *   - хэрэглэгч бичиж байгаагаа хараад чадахгүй.
 *
 * Тиймээс ХОЁР давхарга нэмэв:
 *   KeyboardAvoidingView — гар гарч ирэхэд агуулгыг дээш түлхэнэ
 *   ScrollView          — жижиг дэлгэцэд форм багтахгүй бол гүйлгэж болно
 */

import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { shared } from '@/components/ui';
import { Colors } from '@/constants/theme';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <KeyboardAvoidingView
      style={s.flex}
      /**
       * iOS ба Android нь гарыг өөр өөрөөр зохицуулдаг:
       *   iOS     — систем нь юу ч хийхгүй тул бид агуулгын өндрийг багасгана.
       *   Android — систем нь цонхыг өөрөө жижигрүүлдэг тул нэмэлт хэрэггүй.
       * Буруу утга сонговол агуулга хоёр дахин дээш үсэрнэ.
       */
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.content}
        // Талбар бөглөж байхад "Sign in" товч дарахад эхний хүрэлт нь гарыг
        // хаагаад ЗОГСДОГ (товч дарагдахгүй). 'handled' нь хүрэлтийг товч руу
        // дамжуулна — хэрэглэгч хоёр удаа дарах шаардлагагүй болно.
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.logo}>
          <Ionicons name="book-outline" size={26} color={Colors.white} />
        </View>

        <Text style={s.title}>{title}</Text>
        {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}

        <View style={[shared.surface, s.card]}>{children}</View>

        {/* EmailVerified хуудас footer дамжуулдаггүй — хоосон мөр үлдээхгүй. */}
        {footer && <View style={s.footer}>{footer}</View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    // Веб дээр max-width: 440px + margin: auto байсан. Утасны дэлгэц үүнээс
    // нарийн тул өргөнийг хязгаарлах шаардлагагүй — зөвхөн хажуугийн зай.
    padding: 24,
    paddingTop: 40,
    paddingBottom: 48,
    // flexGrow — агуулга богино үед ч ScrollView-ийн бүтэн өндрийг эзэлнэ.
    flexGrow: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: { marginTop: 8, color: Colors.textMuted, textAlign: 'center', lineHeight: 21 },
  card: { marginTop: 28, padding: 24 },
  footer: { marginTop: 24, alignItems: 'center' },
});
