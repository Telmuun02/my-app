/**
 * ===== Миний зээлсэн номууд (/cart) =====
 *
 * frontend/src/pages/Cart.jsx-ийн хувилбар.
 *
 * АЮУЛГҮЙ БАЙДЛЫН САНАМЖ (веб дээрхтэй ижил, давтан бичих нь зүйтэй):
 * Өгөгдөл нь GET /api/loans-оос ирнэ. Хэрэглэгчийн id-г ДАМЖУУЛАХГҮЙ — backend
 * нь Authorization токеноос хэн болохыг мэдээд, зөвхөн тухайн хүний зээллэгийг
 * буцаадаг. Клиентээс ирсэн id-д итгэвэл хэн ч дурын дугаар бичээд бусдын
 * өгөгдлийг уншиж чадна.
 *
 * БАЙРЛАЛЫН ЯЛГАА: веб дээр мөр бүр нь ХӨНДЛӨН (нэр | огноо | төлөв). Утсан
 * дээр тэр гурав багтахгүй тул мөр бүрийг ЖИЖИГ КАРТ болгож босоо байрлуулав —
 * Cart.css дотор 700px-ээс доош хийдэг @media дүрэмтэй ижил санаа.
 */

import { Link, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import client, { apiError } from '@/api/client';
import { EmptyState, PageTitle, Pill, PrimaryLink, shared } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

/** Backend-ээс ирдэг зээллэгийн хэлбэр. */
type Loan = {
  id: number;
  book_id: number;
  user_id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  book?: { title?: string } | null;
  user?: { name?: string } | null;
};

/** Өнөөдрийн огноо "YYYY-MM-DD" хэлбэрээр (орон нутгийн цагаар). */
function todayString(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Зээллэгийн төлөв: буцаагдсан / хугацаа хэтэрсэн / идэвхтэй.
 *
 * "YYYY-MM-DD" хэлбэрийн огноог МӨРӨӨР харьцуулж болно — форматын дараалал нь
 * он → сар → өдөр тул цагаан толгойн эрэмбэ нь цаг хугацааны эрэмбэтэй таарна.
 */
function loanStatus(loan: Loan): { label: string; tone: 'avail' | 'out' | 'late' } {
  if (loan.return_date) return { label: 'Буцаагдсан', tone: 'out' };
  if (loan.due_date < todayString()) return { label: 'Хугацаа хэтэрсэн', tone: 'late' };
  return { label: 'Зээлсэн', tone: 'avail' };
}

export default function CartScreen() {
  const { user, loading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      // Нэвтрээгүй бол дуудах утгагүй — 401 авахаас өмнө зогсооно.
      if (!user) {
        setLoading(false);
        return;
      }

      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);

      try {
        const res = await client.get('/loans');
        setLoans(res.data);
        setError('');
      } catch (err) {
        setError(apiError(err, 'Зээллэгийн мэдээлэл ачаалж чадсангүй.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    load();
  }, [load]);

  if (authLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  // Нэвтрээгүй үед
  if (!user) {
    return (
      <View style={s.page}>
        <PageTitle>Миний зээлсэн номууд</PageTitle>
        <EmptyState>Зээллэгээ харахын тулд нэвтэрнэ үү.</EmptyState>
        <PrimaryLink href="/signin" title="Нэвтрэх" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={s.flex}>
      <Stack.Screen options={{ title: 'Миний зээлсэн номууд' }} />

      <FlatList
        data={loans}
        keyExtractor={(loan) => String(loan.id)}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
        renderItem={({ item }) => <LoanRow loan={item} currentUserId={user.id} />}
        ListEmptyComponent={
          error ? (
            <EmptyState>{error}</EmptyState>
          ) : (
            <View>
              <EmptyState>Одоогоор зээлсэн ном алга.</EmptyState>
              {/* Зээл нь queue-гээр боловсруулагддаг (POST /loans → 202 Accepted)
                  тул дөнгөж зээлсэн ном шууд гарч ирэхгүй байж болно. */}
              <Text style={s.hint}>
                Саяхан зээлсэн бол хэдэн секундын дараа доош чирж сэргээгээрэй.
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load('refresh')}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

function LoanRow({ loan, currentUserId }: { loan: Loan; currentUserId: number }) {
  const status = loanStatus(loan);

  return (
    <View style={[shared.surface, s.row]}>
      <View style={s.rowHead}>
        {/* Зээллэгийн дугаар — лавлагааны дугаар. Хэрэглэгч админтай
            холбогдоход "#42-той зээллэг" гэж хэлэх, эсвэл log-оос хайхад
            ашиглана. Моно фонт нь 1 ба l, 0 ба O-г андуурахаас сэргийлнэ. */}
        <Text style={shared.monoSmall}>#{loan.id}</Text>
        <Pill tone={status.tone}>{status.label}</Pill>
      </View>

      <Link href={`/books/${loan.book_id}`} asChild>
        <Pressable accessibilityRole="link">
          {({ pressed }) => (
            <Text style={[s.title, pressed && s.titlePressed]} numberOfLines={2}>
              {loan.book?.title ?? 'Ном'}
            </Text>
          )}
        </Pressable>
      </Link>

      {/* Админ дансаар бүх хүний зээллэг ирдэг тул өөрийнх биш бол хэн
          зээлснийг харуулна. */}
      {loan.user_id !== currentUserId && loan.user?.name && (
        <Text style={s.owner}>{loan.user.name}</Text>
      )}

      <View style={s.dates}>
        <DateCell label="Зээлсэн" value={loan.loan_date} />
        <DateCell label="Буцаах" value={loan.due_date} />
      </View>
    </View>
  );
}

function DateCell({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={s.dateLabel}>{label}</Text>
      <Text style={s.dateValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 8, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: { padding: 16, gap: 12 },
  row: { padding: 16, gap: 8 },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text },
  titlePressed: { color: Colors.primary },
  owner: { fontSize: 13, color: Colors.textMuted },

  dates: { flexDirection: 'row', gap: 28, marginTop: 4 },
  dateLabel: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: Colors.textMuted },
  dateValue: { marginTop: 2, fontSize: 14, fontWeight: '600', color: Colors.text },

  hint: { fontSize: 14, lineHeight: 21, color: Colors.textMuted, paddingHorizontal: 2 },
});
