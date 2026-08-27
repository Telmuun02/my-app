/**
 * ===== Бүртгүүлэх (/register) =====
 *
 * frontend/src/pages/Register.jsx-ийн хувилбар.
 *
 * ХАТУУ ГОРИМ (веб дээрхтэй ижил): backend нь бүртгэлийн хариунд token
 * БУЦААХГҮЙ. Тиймээс энд шууд нэвтрүүлэхгүй — "мэйлээ шалгана уу" дэлгэц
 * харуулж, хэрэглэгч и-мэйлээ баталгаажуулсны дараа /signin-ээр нэвтэрнэ.
 *
 * Анхаар: backend "confirmed" дүрэмтэй тул password_confirmation талбар шаардана.
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import client, { apiError } from '@/api/client';
import { AuthLayout } from '@/components/AuthLayout';
import { VerifyNotice } from '@/components/VerifyNotice';
import { Field, InlineLink, Notice, PrimaryButton } from '@/components/ui';
import { Colors } from '@/constants/theme';

type FormKey = 'name' | 'email' | 'company_id' | 'password' | 'password_confirmation';

export default function RegisterScreen() {
  const [form, setForm] = useState<Record<FormKey, string>>({
    name: '',
    email: '',
    company_id: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Бүртгэл амжилттай болмогц энд и-мэйл хаяг орж, дэлгэц солигдоно.
  const [pendingEmail, setPendingEmail] = useState('');

  const update = (key: FormKey) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // Амжилттай бол backend { user, email, message } буцаана (201). Token БАЙХГҮЙ.
      const { data } = await client.post('/register', form);
      setPendingEmail(data.email);
    } catch (err) {
      setError(apiError(err, 'Бүртгэхэд алдаа гарлаа.'));
    } finally {
      setLoading(false);
    }
  };

  // Бүртгэл амжилттай — форм биш, баталгаажуулах заавар харуулна.
  if (pendingEmail) {
    return (
      <AuthLayout
        title="Мэйлээ шалгана уу"
        subtitle="Бүртгэл үүслээ — дараагийн алхам ганцхан"
        footer={
          <View style={s.footerRow}>
            <Text style={s.footerText}>Баталгаажуулсан уу? </Text>
            <InlineLink href="/signin" title="Нэвтрэх" />
          </View>
        }
      >
        <VerifyNotice email={pendingEmail} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Бүртгэл үүсгэх"
      subtitle="Folio-д нэгдэж ном зээлж эхлээрэй"
      footer={
        <View style={s.footerRow}>
          <Text style={s.footerText}>Бүртгэлтэй юу? </Text>
          <InlineLink href="/signin" title="Нэвтрэх" />
        </View>
      }
    >
      <View style={s.form}>
        <Field
          label="Бүтэн нэр"
          value={form.name}
          onChangeText={update('name')}
          placeholder="Alex Chen"
          autoComplete="name"
        />

        <Field
          label="И-мэйл хаяг"
          value={form.email}
          onChangeText={update('email')}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />

        <Field
          label="Байгууллагын дугаар"
          value={form.company_id}
          onChangeText={update('company_id')}
          placeholder="3"
          // number-pad — зөвхөн тоо бүхий гар гарч ирнэ. Веб дээрх
          // type="number"-ээс ялгаатай нь: энэ нь ЗӨВХӨН гарыг солино,
          // утга нь мөр хэвээр. Backend руу мөр илгээхэд асуудалгүй —
          // Laravel нь баталгаажуулахдаа өөрөө тоо руу хөрвүүлнэ.
          keyboardType="number-pad"
        />

        <Field
          label="Нууц үг"
          value={form.password}
          onChangeText={update('password')}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
        />

        <Field
          label="Нууц үг давтах"
          value={form.password_confirmation}
          onChangeText={update('password_confirmation')}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {error ? <Notice tone="err">{error}</Notice> : null}

        <PrimaryButton title="Бүртгэл үүсгэх" onPress={handleSubmit} busy={loading} block />
      </View>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  form: { gap: 18 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: Colors.textMuted, fontSize: 15 },
});
