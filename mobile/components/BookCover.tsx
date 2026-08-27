/**
 * ===== Номын хавтас =====
 *
 * frontend/src/App.css дахь `.book-cover`-ийн хувилбар. BookCard-ийн жижиг карт
 * ба BookDetail-ийн том хавтас хоёулаа үүнийг ашиглана.
 *
 * ВЕБ ДЭЭР ЭНЭ НЬ ХОЁР ДАВХАР `background-image` БАЙСАН:
 *
 *     backgroundImage: `${gradient}, url(${CARD_BACKGROUND_URL})`,
 *     backgroundBlendMode: "multiply",
 *
 * React Native-д `background-image` ч, `background-blend-mode` ч БАЙХГҮЙ.
 * Тиймээс тэр эффектийг ГУРВАН ДАВХАР View-гээр дахин барина:
 *
 *     1. Cloudinary дэвсгэр зураг      (хамгийн доор)
 *     2. Ангиллын градиент, хагас тунгалаг  ← "multiply"-ийн ойролцоо
 *     3. Текст, ном хавтасны зураг     (хамгийн дээр)
 *
 * Яагаад opacity нь multiply-ийн ОЙРОЛЦОО болохоос ЯГ ТЭР биш вэ: multiply нь
 * пиксель бүрийг үржүүлж, харанхуй хэсгийг илүү харанхуй болгодог. Хагас
 * тунгалаг давхарга нь ердөө хольдог тул үр дүн бага зэрэг цайвар. Нүдээр
 * ялгагдахааргүй ойрхон тул нэмэлт сан татахгүйгээр үүнийг сонгов.
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  CARD_BACKGROUND_URL,
  COVER_GRADIENTS,
  FALLBACK_GRADIENT,
  GRADIENT_END,
  GRADIENT_START,
  Radius,
  Shadow,
} from '@/constants/theme';

export function BookCover({
  category,
  children,
  style,
  /** Дэвсгэр зургийг унтраана — BookDetail дээр цэвэр градиент илүү зөв харагдана. */
  showBackdrop = true,
}: {
  category?: string | null;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showBackdrop?: boolean;
}) {
  const gradient = (category && COVER_GRADIENTS[category]) || FALLBACK_GRADIENT;

  return (
    <View style={[s.cover, style]}>
      {showBackdrop && (
        <Image
          source={CARD_BACKGROUND_URL}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          // expo-image нь татсан зургаа диск дээр кэшлэнэ — жагсаалт гүйлгэх
          // бүрд дахин татахгүй (утасны дата хэмнэнэ).
          cachePolicy="memory-disk"
          // Зураг ирэх хүртэл богино уусалт. Гэнэт "цасан шуурга" шиг
          // солигдохоос сэргийлнэ.
          transition={200}
        />
      )}

      <LinearGradient
        colors={[...gradient]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={[StyleSheet.absoluteFill, showBackdrop && s.blend]}
      />

      {/* Агуулга — градиентын ДЭЭР. Веб дээрх justify-content: space-between
          гэдэг нь эхний хүүхэд дээр, сүүлийнх доор гэсэн үг. */}
      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  cover: {
    // Веб дээр: aspect-ratio: 3 / 4. RN нь SDK 54-д үүнийг дэмждэг.
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    // overflow: 'hidden' — үүнгүй бол доторх зураг дугуй булангаас цухуйна.
    overflow: 'hidden',
    ...Shadow,
  },
  /** Дэвсгэр зурагтай үед градиентыг арай тунгалаг болгож зургийг харуулна. */
  blend: { opacity: 0.85 },
  content: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
});
