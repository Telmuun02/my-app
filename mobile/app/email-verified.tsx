/**
 * ===== Баталгаажуулалтын үр дүн (/email-verified) =====
 *
 * frontend/src/pages/EmailVerified.jsx-ийн хувилбар.
 *
 * ⚠️ ЭНЭ ДЭЛГЭЦ ОДООГООР УТСАН ДЭЭР ӨӨРӨӨ НЭЭГДЭХГҮЙ — учрыг нь уншина уу.
 *
 * Веб дээр урсгал нь: мэйл дэх холбоос → backend → хөтөч рүү redirect
 *     http://localhost:5173/email-verified?status=success
 *
 * Утсан дээр мэйл дэх холбоосыг дарахад ХӨТӨЧ нээгдэнэ, апп биш. Backend-ийн
 * EmailVerificationController нь FRONTEND_URL (=5173) руу л чиглүүлдэг тул
 * баталгаажуулалт нь хөтөч дээр дуусна. Хэрэглэгч дараа нь апп руу буцаж
 * гараар нэвтэрнэ — энэ нь ажилладаг, зүгээр л жигд биш.
 *
 * АППЫГ ШУУД НЭЭЛГЭХИЙН ТУЛД (deep link) ХОЁР ЗҮЙЛ ХЭРЭГТЭЙ:
 *   1. app.json дотор "scheme": "mobile" аль хэдийн бий → mobile://email-verified
 *   2. backend нь утаснаас ирсэн эсэхийг мэдээд тэр scheme рүү redirect хийх
 *      (эсвэл универсал холбоос тохируулах).
 * Хоёр дахь нь backend-ийн засвар тул одоохондоо хийгээгүй. Дэлгэцийг нь
 * бэлэн үлдээв — deep link холбогдмогц ажиллаж эхэлнэ.
 */

import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Notice, PrimaryLink } from '@/components/ui';

/** Backend-ийн EmailVerificationController::frontend() яг эдгээр утгыг илгээдэг. */
const MESSAGES = {
  success: {
    title: 'Баталгаажлаа',
    subtitle: 'И-мэйл хаяг чинь амжилттай баталгаажлаа',
    text: 'Одоо нэвтрээд ном зээлэх боломжтой боллоо.',
    tone: 'ok',
  },
  already: {
    title: 'Аль хэдийн баталгаажсан',
    subtitle: 'Энэ хаяг өмнө нь баталгаажсан байна',
    text: 'Шууд нэвтэрч болно.',
    tone: 'ok',
  },
  error: {
    title: 'Холбоос хүчингүй',
    subtitle: 'Холбоосын хугацаа дууссан эсвэл буруу байна',
    text: 'Нэвтрэх дэлгэцээр орж шинэ холбоос хүсэх боломжтой.',
    tone: 'err',
  },
} as const;

export default function EmailVerifiedScreen() {
  // Веб дээр useSearchParams() байсан; expo-router-т замын болон query
  // параметрийг НЭГ hook-оор уншина.
  const { status } = useLocalSearchParams<{ status?: string }>();
  const info = MESSAGES[status as keyof typeof MESSAGES] ?? MESSAGES.error;

  return (
    <AuthLayout title={info.title} subtitle={info.subtitle}>
      <View style={s.wrap}>
        <Notice tone={info.tone}>{info.text}</Notice>

        {/* replace — түүхэн дэх энэ дэлгэцийг СОЛИНО. Ингэснээр нэвтэрсний
            дараа "буцах" дарахад баталгаажуулалтын дэлгэц рүү эргэж орохгүй. */}
        <PrimaryLink href="/signin" title="Нэвтрэх" block replace />
      </View>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 16 },
});
