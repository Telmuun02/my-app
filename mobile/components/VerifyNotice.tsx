/**
 * ===== И-мэйл баталгаажуулах самбар =====
 *
 * frontend/src/components/VerifyNotice.jsx-ийн хувилбар. Логик нь ЯГ ИЖИЛ —
 * зөвхөн <p>/<button> нь <Text>/<PrimaryButton> болов.
 *
 * Register (бүртгэлийн дараа) ба SignIn (403 авсан үед) хоёулаа ашиглана.
 * Энэ endpoint нь нээлттэй (токен шаардахгүй) — учир нь баталгаажаагүй
 * хэрэглэгчид токен байдаггүй.
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import client, { apiError } from '@/api/client';
import { Notice, PrimaryButton } from '@/components/ui';
import { Colors } from '@/constants/theme';

export function VerifyNotice({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const resend = async () => {
    setSending(true);
    setNote('');
    setError('');
    try {
      const { data } = await client.post('/email/verification-notification', { email });
      setNote(data.message);
    } catch (err: any) {
      // 429 = хэт олон хүсэлт (минутад 5 удаа). Бусад нь серверийн алдаа.
      setError(
        err?.response?.status === 429
          ? 'Хэт олон удаа оролдлоо. Нэг минутын дараа дахин үзнэ үү.'
          : apiError(err, 'Илгээхэд алдаа гарлаа.')
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={s.wrap}>
      {/* Веб дээр <strong> байсныг энд ДОТООД <Text> болгов — RN-д Text
          дотор Text угсарч, зөвхөн тэр хэсэгт өөр загвар өгч болно. */}
      <Text style={s.lead}>
        Бид <Text style={s.strong}>{email}</Text> хаяг руу баталгаажуулах холбоос илгээлээ.
      </Text>

      <Text style={s.hint}>
        Мэйл дэх товчийг дарж бүртгэлээ идэвхжүүлнэ үү. Холбоос 60 минутын дараа хүчингүй
        болно. Ирээгүй бол спам хавтсаа шалгаарай.
      </Text>

      <PrimaryButton
        title="Холбоосыг дахин илгээх"
        onPress={resend}
        busy={sending}
        block
      />

      {note ? <Notice tone="ok">{note}</Notice> : null}
      {error ? <Notice tone="err">{error}</Notice> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 16 },
  lead: { fontSize: 15, lineHeight: 22, color: Colors.text },
  strong: { fontWeight: '700' },
  hint: { fontSize: 14, lineHeight: 21, color: Colors.textMuted },
});
