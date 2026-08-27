/**
 * ===== Номын дэлгэрэнгүй (/books/42) =====
 *
 * frontend/src/pages/BookDetail.jsx-ийн хувилбар.
 *
 * ФАЙЛЫН НЭР `[id].tsx` нь веб дээрх `path="/books/:id"`-тэй ижил үүрэгтэй:
 * дөрвөлжин хаалт нь "энэ хэсэг нь ДИНАМИК" гэсэн үг. Утгыг нь веб дээр
 * useParams()-аар уншдаг байсан бол энд useLocalSearchParams()-аар уншина.
 * Хоёуланд нь ТЭМДЭГТ МӨР ирдгийг анхаар (тоо биш).
 *
 * БАЙРЛАЛЫН ЯЛГАА: веб дээр `.detail__grid` нь хавтас, мэдээлэл хоёрыг ЗЭРЭГЦҮҮЛЖ
 * тавьдаг. Утасны өргөнд тэгвэл хоёулаа хэтэрхий нарийн болно — тиймээс хавтсыг
 * ДЭЭР, мэдээллийг ДООР нь босоо байрлуулав.
 */

import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borrowBook, normalizeBookDetail, type BookDetail } from '@/api/books';
import client, { apiError } from '@/api/client';
import { BookCover } from '@/components/BookCover';
import { Rating } from '@/components/Rating';
import {
  BackLink,
  BadgeCompany,
  BadgeOutline,
  EmptyState,
  Notice,
  Pill,
  PrimaryButton,
  PrimaryLink,
  TagRow,
} from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Зээлэх үйлдлийн төлөв
  const [borrowing, setBorrowing] = useState(false);
  const [message, setMessage] = useState('');

  // Үнэлгээ. АНХААР: backend-д одоогоор rating endpoint БАЙХГҮЙ тул энэ нь
  // зөвхөн локал төлөв — дэлгэцээс гармагц алга болно.
  const [rating, setRating] = useState<number | null>(null);

  // id өөрчлөгдөх бүрд (өөр ном руу шилжихэд) дахин татна.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage('');
    // Өөр ном руу шилжихэд компонент дахин mount хийгддэггүй (зөвхөн [id]
    // солигддог) тул өмнөх номын үнэлгээ үлдэхээс сэргийлж цэвэрлэнэ.
    setRating(null);

    client
      .get(`/books/${id}`)
      .then((res) => {
        if (!active) return;
        setBook(normalizeBookDetail(res.data));
        setError('');
      })
      .catch((err: any) => {
        if (!active) return;
        // 404 — ийм id-тай ном байхгүй. Бусад тохиолдолд сүлжээ/сервер алдаа.
        setError(
          err?.response?.status === 404
            ? 'Ийм ном олдсонгүй.'
            : apiError(err, 'Мэдээлэл ачаалж чадсангүй. Backend асаалттай юу?')
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Хариу ирэхээс өмнө дэлгэц солигдвол setState хийхгүй байх хамгаалалт.
    return () => {
      active = false;
    };
  }, [id]);

  const handleBorrow = async () => {
    if (!book) return;

    setBorrowing(true);
    setMessage('');
    try {
      const dueDate = await borrowBook(book.id);
      // Серверээс дахин татахгүйгээр локал тоогоо шинэчилнэ.
      setBook((prev) => (prev ? { ...prev, available: prev.available - 1 } : prev));
      setMessage(`Зээллээ. Буцаах хугацаа: ${dueDate}`);
    } catch (err) {
      setMessage(apiError(err, 'Зээлэхэд алдаа гарлаа.'));
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={s.page}>
        <EmptyState>{error || 'Ном олдсонгүй.'}</EmptyState>
        <BackLink />
      </View>
    );
  }

  const isAvailable = book.available > 0;

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={[s.page, { paddingBottom: insets.bottom + 40 }]}
    >
      {/* Гарчгийг номын нэрээр солино. Веб дээр толгой мөр статик "Folio"
          байсан — утсан дээр толгой нь навигацийн хэсэг тул хаана байгаагаа
          хэлж өгвөл илүү ойлгомжтой. */}
      <Stack.Screen options={{ title: book.title }} />

      {/* Зүүн тал биш, ДЭЭД тал: номын хавтас.
          Өргөнийг 70% болгож хязгаарласан нь — бүтэн өргөнөөр тавибал 3:4
          харьцаатай тул өндөр нь дэлгэцээс давж, мэдээлэл огт харагдахгүй. */}
      <View style={s.coverWrap}>
        <BookCover category={book.category} showBackdrop={false} style={s.cover}>
          {book.cover_url ? (
            // Зурагтай үед градиент нь зөвхөн ФОН — зураг бүтэн хэмжээгээр наана.
            <Image
              source={book.cover_url}
              style={s.coverImg}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            // Зураггүй үеийн нөөц хувилбар: ангилал + гарчиг градиент дээр
            <>
              <Text style={s.coverCategory}>{book.category.toUpperCase()}</Text>
              <View>
                <Text style={s.coverTitle}>{book.title}</Text>
                <Text style={s.coverAuthor}>{book.author}</Text>
              </View>
            </>
          )}
        </BookCover>
      </View>

      {/* Мэдээлэл */}
      <View style={s.info}>
        <TagRow>
          <BadgeOutline>{book.category}</BadgeOutline>
          {book.company && <BadgeCompany>{book.company}</BadgeCompany>}
        </TagRow>

        <Text style={s.title}>{book.title}</Text>
        <Text style={s.authors}>{book.author || 'Unknown author'}</Text>

        <Rating label="Үнэлгээ" value={rating} onChange={setRating} />

        {/* Веб дээр <dl>/<dt>/<dd>. RN-д тийм элемент байхгүй тул энгийн
            мөрүүд болгов — утга нь ижил: нэр зүүн, утга баруун талд. */}
        <View style={s.meta}>
          <MetaRow label="ISBN" value={book.isbn ?? '—'} />
          <MetaRow label="Нийт хувь" value={book.total != null ? String(book.total) : '—'} />
          <MetaRow label="Боломжтой" value={String(book.available)} />
        </View>

        <View style={s.actions}>
          <Pill tone={isAvailable ? 'avail' : 'out'}>
            {isAvailable ? `${book.available} avail.` : 'Checked out'}
          </Pill>

          {user ? (
            <PrimaryButton
              title={isAvailable ? 'Borrow' : 'Unavailable'}
              onPress={handleBorrow}
              disabled={!isAvailable}
              busy={borrowing}
              block
            />
          ) : (
            // Нэвтрээгүй бол зээлэх боломжгүй — нэвтрэх дэлгэц рүү заана.
            <PrimaryLink href="/signin" title="Нэвтэрч зээлэх" block />
          )}
        </View>

        {message ? <Notice tone="ok">{message}</Notice> : null}
      </View>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={s.metaValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  page: { paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  coverWrap: { alignItems: 'center' },
  cover: { width: '70%' },
  // BookCover-ийн дотоод padding-ийг үл тоож бүтэн талбайг эзлэхийн тулд
  // сөрөг margin. Ингэснээр зураг хавтасны ирмэг хүртэл дүүрнэ.
  coverImg: { flex: 1, margin: -18, borderRadius: 0 },
  coverCategory: { fontSize: 11, letterSpacing: 1.3, color: 'rgba(255,255,255,0.55)' },
  coverTitle: { fontSize: 20, lineHeight: 25, fontWeight: '700', color: Colors.white },
  coverAuthor: { marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  info: { marginTop: 24, gap: 14 },
  title: { fontSize: 26, lineHeight: 31, fontWeight: '700', color: Colors.text },
  authors: { fontSize: 15, color: Colors.textMuted, marginTop: -8 },

  meta: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  metaLabel: { fontSize: 13, color: Colors.textMuted },
  metaValue: { fontSize: 15, fontWeight: '600', color: Colors.text },

  actions: { gap: 12 },
});
