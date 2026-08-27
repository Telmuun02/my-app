/**
 * ===== Нэвтрэх (/signin) =====
 *
 * frontend/src/pages/SignIn.jsx-ийн хувилбар. Логик нь бараг ижил.
 *
 * ХОЁР ЯЛГАА:
 *
 * 1. onAuth prop БАЙХГҮЙ.
 *    Веб дээр App.jsx нь `onAuth` функцээ SignIn руу prop-оор дамжуулдаг байсан.
 *    Энд дэлгэцийг router render хийдэг тул prop дамжуулах газар алга — оронд
 *    нь context-оос шууд `signIn`-ыг авна.
 *
 * 2. router.replace('/') хэрэглэв, push биш.
 *    replace нь навигацийн ТҮҮХЭН ДЭХ нэвтрэх дэлгэцийг СОЛИНО. Хэрэв push
 *    хийвэл нэвтэрсний дараа утасны "буцах" товч дарахад нэвтрэх дэлгэц рүү
 *    эргэж орно — аль хэдийн нэвтэрчихсэн байхад утгагүй.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import client, { apiError } from '@/api/client';
import { AuthLayout } from '@/components/AuthLayout';
import { VerifyNotice } from '@/components/VerifyNotice';
import { Field, InlineLink, Notice, PrimaryButton, TextButton } from '@/components/ui';
import { Colors, Font, Radius } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Нууц үг зөв ч и-мэйл баталгаажаагүй үед backend 403 + email_unverified буцаана.
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Нэг handler-аар бүх талбарыг шинэчилнэ. Веб дээр `e.target.name`-ээр
  // талбараа таньдаг байсан; RN-ийн onChangeText нь зөвхөн ТЕКСТ дамжуулдаг
  // тул талбарын нэрийг гараар өгнө.
  const update = (key: 'email' | 'password') => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    setUnverifiedEmail('');
    setLoading(true);
    try {
      // Амжилттай бол backend { user, token } буцаана.
      const { data } = await client.post('/login', form);
      await signIn(data); // токеныг SecureStore-д хадгална
      router.replace('/');
    } catch (err: any) {
      // 403 + email_unverified — нууц үг зөв, зөвхөн баталгаажуулалт дутуу.
      // Энэ тохиолдолд улаан алдаа биш, дахин илгээх самбар харуулна.
      if (err?.response?.status === 403 && err.response?.data?.email_unverified) {
        setUnverifiedEmail(err.response.data.email);
      } else {
        setError(apiError(err, 'Нэвтрэхэд алдаа гарлаа.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Баталгаажаагүй — формын оронд заавар + дахин илгээх товч.
  if (unverifiedEmail) {
    return (
      <AuthLayout
        title="И-мэйл баталгаажаагүй"
        subtitle="Нэвтрэхийн өмнө хаягаа баталгаажуулна уу"
        footer={<TextButton title="← Дахин нэвтрэх" onPress={() => setUnverifiedEmail('')} />}
      >
        <VerifyNotice email={unverifiedEmail} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Тавтай морил"
      subtitle="Folio бүртгэлээрээ нэвтэрнэ үү"
      footer={
        <View style={s.footerRow}>
          <Text style={s.footerText}>Бүртгэлгүй юу? </Text>
          <InlineLink href="/register" title="Бүртгүүлэх" />
        </View>
      }
    >
      <View style={s.form}>
        <Field
          label="И-мэйл хаяг"
          value={form.email}
          onChangeText={update('email')}
          placeholder="you@example.com"
          // Утасны гар нь эдгээрээр өөрчлөгддөг:
          //   keyboardType="email-address" → @ тэмдэг гарт шууд гарч ирнэ
          //   autoCapitalize="none"        → эхний үсгийг том болгохгүй
          //   autoComplete="email"         → өмнө бичсэн хаягийг санал болгоно
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />

        <Field
          label="Нууц үг"
          value={form.password}
          onChangeText={update('password')}
          placeholder="••••••••"
          // secureTextEntry — веб дээрх type="password"-ийн дүйцэл.
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          // Гар дээрх "enter" нь "Нэвтрэх" болно; дарахад формыг илгээнэ.
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {error ? <Notice tone="err">{error}</Notice> : null}

        <PrimaryButton title="Нэвтрэх" onPress={handleSubmit} busy={loading} block />

        {/* Seed-ээр үүсгэсэн туршилтын бүртгэлүүд */}
        <View style={s.demo}>
          <Text style={s.demoText}>Туршилтын бүртгэл (нууц үг: password):</Text>
          <Text style={s.demoCode}>admin@example.com → Admin</Text>
          <Text style={s.demoCode}>test@example.com → Member</Text>
        </View>
      </View>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  form: { gap: 18 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: Colors.textMuted, fontSize: 15 },
  demo: {
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    gap: 4,
  },
  demoText: { fontSize: 13, color: Colors.textMuted },
  demoCode: { fontFamily: Font.mono, fontSize: 13, color: Colors.text },
});
