/**
 * ===== Номын карт =====
 *
 * frontend/src/components/BookCard.jsx-ийн хувилбар.
 *
 * ВЕБ ДЭЭРЭЭС ЯЛГААТАЙ ХОЁР ЗҮЙЛ:
 *
 * 1. Footer нь БОСОО болов.
 *    Веб дээр `display: flex` — pill ба Borrow товч зэрэгцээ байрладаг. Утсан
 *    дээр карт нь дэлгэцийн хагас (~170px) өргөнтэй тул зэрэгцүүлбэл товчны
 *    текст 2 мөр болж, карт бүр өөр өндөртэй болно. Дээр нь pill, доор нь
 *    бүтэн өргөнтэй товч байрлуулав.
 *
 * 2. `hover` төлөв алга, `pressed` төлөв нэмэгдэв.
 *    Веб дээр .card__link:hover нь хавтсыг 4px дээш өргөдөг. Утсан дээр хулгана
 *    байхгүй тул түүний оронд дарах агшинд бүхэл карт бага зэрэг бүдгэрнэ.
 */

import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Book } from '@/api/books';
import { BookCover } from '@/components/BookCover';
import { BadgeCompany, BadgeOutline, Pill, TagRow } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';

type Props = {
  book: Book;
  /** Нэвтэрсэн эсэх — зээлэх товч идэвхжинэ. */
  signedIn: boolean;
  onBorrow: (id: number) => void;
  /** Тухайн ном дээр зээлэх хүсэлт яг одоо явж байна уу. */
  borrowing?: boolean;
};

function BookCardBase({ book, signedIn, onBorrow, borrowing }: Props) {
  const isAvailable = book.available > 0;

  return (
    <View style={s.card}>
      {/* Дарж болох хэсэг: хавтас + мэдээлэл → /books/:id рүү шилжинэ.
          Zээлэх товч нь ЭНЭ Link-ийн ГАДНА байна — эс бөгөөс товч дарах бүрд
          дэлгэрэнгүй хуудас руу бас үсэрнэ (веб хувилбартай ижил шалтгаан). */}
      <Link href={`/books/${book.id}`} asChild>
        <Pressable style={({ pressed }) => pressed && s.pressed} accessibilityRole="link">
          <BookCover category={book.category}>
            <Text style={s.coverCategory}>{book.category.toUpperCase()}</Text>

            {/* Номын жинхэнэ хавтасны зураг — backend-ээс (Cloudinary) ирнэ.
                Веб дээр `onError` -оор нуудаг байсныг энд хийх шаардлагагүй:
                expo-image нь зураг ирээгүй үед юу ч зурахгүй, доорх градиент
                хэвээр харагдана. */}
            {book.cover_url && (
              <Image
                source={book.cover_url}
                style={s.coverImg}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            )}

            <View>
              <Text style={s.coverTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={s.coverAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            </View>
          </BookCover>

          {/* Хавтасны доорх мэдээлэл.
              numberOfLines — веб дээр текст хэдэн ч мөр болж, карт сунадаг.
              Сүлжээгээр 2 баганат жагсаалтад тэгвэл мөрүүд эгнэхээ болино.
              Тиймээс мөрийн тоог тогтоож, урт гарчгийг "…" болгож таслав. */}
          <View style={s.body}>
            <Text style={s.title} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={s.author} numberOfLines={1}>
              {book.author}
            </Text>
            <TagRow>
              <BadgeOutline>{book.category}</BadgeOutline>
              {/* Аль байгууллагын ном болох нь. Админ олон компанийн номыг
                  зэрэг хардаг тул энэ ялгаа чухал. */}
              {book.company && <BadgeCompany>{book.company}</BadgeCompany>}
            </TagRow>
          </View>
        </Pressable>
      </Link>

      {/* Footer: боломжтой тоо + зээлэх товч */}
      <View style={s.footer}>
        <Pill tone={isAvailable ? 'avail' : 'out'}>
          {isAvailable ? `${book.available} avail.` : 'Checked out'}
        </Pill>

        <Pressable
          style={({ pressed }) => [s.borrow, pressed && s.pressed]}
          disabled={!signedIn || !isAvailable || borrowing}
          onPress={() => onBorrow(book.id)}
          accessibilityRole="button"
        >
          <Text style={s.borrowText}>
            {!signedIn
              ? 'Нэвтэрч зээлнэ'
              : borrowing
                ? 'Зээлж байна…'
                : isAvailable
                  ? 'Borrow'
                  : 'Unavailable'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * memo — эцэг (Catalog) дахин render хийх бүрд БҮХ карт дахин зурагдахаас
 * сэргийлнэ. `books` массив урт болох тусам (infinite scroll-оор 8 → 16 → 24…)
 * энэ нь мэдэгдэхүйц болно.
 *
 * Ажиллахын тулд prop-ууд нь ижил хэвээр байх ёстой — тиймээс Catalog дотор
 * `onBorrow`-ыг useCallback-аар боов.
 */
export const BookCard = memo(BookCardBase);

const s = StyleSheet.create({
  card: { flex: 1 },
  pressed: { opacity: 0.7 },

  coverCategory: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  // Веб дээр 90×130. Карт нь энд нарийн тул бага зэрэг жижигрүүлэв.
  coverImg: {
    width: 72,
    height: 104,
    alignSelf: 'center',
    borderRadius: 4,
  },
  coverTitle: { fontSize: 15, lineHeight: 19, fontWeight: '700', color: Colors.white },
  coverAuthor: { marginTop: 4, fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' },

  body: { paddingTop: 12, gap: 4 },
  title: { fontSize: 15, lineHeight: 19, fontWeight: '700', color: Colors.text },
  author: { fontSize: 13, color: Colors.textMuted, marginBottom: 6 },

  footer: { marginTop: 10, gap: 8 },
  borrow: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
  },
  borrowText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
});
