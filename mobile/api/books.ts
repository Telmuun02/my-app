/**
 * ===== Номтой холбоотой хэлбэр + туслах функцууд =====
 *
 * Веб дээр `normalizeBook` нь Catalog.jsx болон BookDetail.jsx ХОЁУЛАНД
 * тус тусад нь бичигдсэн байсан. Зээлэх огноо тооцоолох 3 мөр ч мөн адил.
 * Утсан дээр эхнээс нь нэг газар төвлөрүүлье — API-ийн хариу өөрчлөгдвөл
 * НЭГ файл засахад хангалттай.
 */

import client from './client';

/** Жагсаалтад харагдах ном (BookResource). */
export type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  company: string | null;
  available: number;
  cover_url: string | null;
};

/** Дэлгэрэнгүй хуудасны ном (BookDetailResource) — дээрхээс илүү талбартай. */
export type BookDetail = Book & {
  isbn: string | null;
  authors: string[];
  total: number | null;
};

/**
 * API-ийн ном → UI-д хэрэгтэй энгийн бүтэц.
 * BookResource: { authors: ["Нэр"], category: "Нэр", available: N }
 */
export function normalizeBook(raw: any): Book {
  return {
    id: raw.id,
    title: raw.title,
    author: raw.authors?.join(', ') || 'Unknown',
    category: raw.category ?? 'Uncategorized',
    company: raw.company ?? null,
    available: raw.available,
    cover_url: raw.cover_url ?? null,
  };
}

/**
 * Дэлгэрэнгүй хариу.
 *
 * `??`-ууд нь хуучин түүхий загварын хэлбэрийг ч дэмжсэн хэвээр — кэш эсвэл
 * хуучин хариу ирвэл ч эвдрэхгүй (веб хувилбартай ижил бодлого).
 */
export function normalizeBookDetail(raw: any): BookDetail {
  const authors: string[] = (raw.authors ?? []).map((a: any) => a?.name ?? a);

  return {
    id: raw.id,
    title: raw.title,
    isbn: raw.isbn ?? null,
    category: raw.category?.name ?? raw.category ?? 'Uncategorized',
    company: raw.company?.name ?? raw.company ?? null,
    authors,
    author: authors.join(', ') || 'Unknown',
    available: raw.available ?? raw.available_copies ?? 0,
    total: raw.total ?? raw.total_copies ?? null,
    cover_url: raw.cover_url ?? null,
  };
}

/** Зээлийн хугацаа: өнөөдрөөс хойш 14 хоног, "YYYY-MM-DD" хэлбэрээр. */
export function dueDateIn14Days(): string {
  const due = new Date();
  due.setDate(due.getDate() + 14);

  // toISOString() нь UTC руу хөрвүүлдэг тул шөнө дунд орчимд нэг өдрөөр зөрж
  // болзошгүй. Тиймээс орон нутгийн цагаар гараар угсарна (Cart.jsx-тэй ижил).
  const m = String(due.getMonth() + 1).padStart(2, '0');
  const d = String(due.getDate()).padStart(2, '0');
  return `${due.getFullYear()}-${m}-${d}`;
}

/**
 * Ном зээлэх. Амжилттай бол буцаах огноог буцаана.
 *
 * АНХААР: backend нь энэ хүсэлтийг queue руу оруулаад 202 Accepted буцаадаг
 * (CreateLoanJob). Өөрөөр хэлбэл "хүлээж авлаа" гэсэн үг болохоос "хийгдлээ"
 * гэсэн үг биш — тиймээс зээлсэн ном "Миний зээл" дээр шууд гарч ирэхгүй.
 */
export async function borrowBook(bookId: number): Promise<string> {
  const dueDate = dueDateIn14Days();
  await client.post('/loans', { book_id: bookId, due_date: dueDate });
  return dueDate;
}
