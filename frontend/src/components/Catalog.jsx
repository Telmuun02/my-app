import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import BookCard from "./BookCard";
import Pagination from "./Pagination";
import { SearchIcon } from "./icons";
import client from "../api/client";

const PER_PAGE = 8; // Нэг хуудсанд харуулах номын тоо.

// API-ийн ном → компонентуудын хүлээж буй энгийн бүтэц рүү хөрвүүлэх.
// API: { authors: [{name}], category: {name}, available_copies }
// UI :  { author: "...", category: "...", available: N }
function normalizeBook(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.authors?.map((a) => a.name).join(", ") || "Unknown",
    category: book.category?.name ?? "Uncategorized",
    available: book.available_copies,
  };
}

// Номын каталог: зүүн талд шүүлтүүр, баруун талд номын grid.
// query нь header-тэй хуваалцсан хайлт (App-аас ирнэ).
// user — нэвтэрсэн хэрэглэгч (зээлэх боломжтой эсэхийг шийднэ).
function Catalog({ query, onQueryChange, user }) {
  // Backend-ээс татсан өгөгдөл.
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);

  // Анх ачаалахад backend-ээс ном ба ангиллыг зэрэг татна.
  useEffect(() => {
    let active = true; // компонент салсны дараа setState хийхээс сэргийлнэ
    setLoading(true);
    Promise.all([client.get("/books"), client.get("/categories")])
      .then(([booksRes, catsRes]) => {
        if (!active) return;
        setBooks(booksRes.data.map(normalizeBook));
        setCategories(catsRes.data.map((c) => c.name));
        setError("");
      })
      .catch(() => {
        if (active) setError("Өгөгдөл ачаалж чадсангүй. Backend (php artisan serve) асаалттай юу?");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Ном зээлэх: /loans руу POST, амжилттай бол локал available-ийг 1 бууруулна.
  const handleBorrow = async (bookId) => {
    // Буцаах хугацаа: өнөөдрөөс 14 хоногийн дараа (YYYY-MM-DD).
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const dueDate = due.toISOString().slice(0, 10);

    try {
      await client.post("/loans", { book_id: bookId, due_date: dueDate });
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, available: b.available - 1 } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message ?? "Зээлэхэд алдаа гарлаа.");
    }
  };

  // Хайлт + 2 шүүлтүүрийг нэг дор хэрэглэнэ.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchCategory = category === "all" || book.category === category;
      const matchAvailability =
        availability === "all" ||
        (availability === "available" && book.available > 0) ||
        (availability === "checked-out" && book.available === 0);
      const matchQuery =
        q === "" ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q);
      return matchCategory && matchAvailability && matchQuery;
    });
  }, [books, query, category, availability]);

  // Шүүлтүүр/хайлт өөрчлөгдвөл эхний хуудас руу буцаана.
  useEffect(() => {
    setPage(1);
  }, [query, category, availability]);

  // Нийт хуудас ба одоогийн хуудсанд харагдах номнууд.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pageBooks = filtered.slice(start, start + PER_PAGE);

  return (
    <div className="layout">
      <Sidebar
        categories={categories}
        category={category}
        onCategory={setCategory}
        availability={availability}
        onAvailability={setAvailability}
      />

      <main className="content">
        <div className="content__head">
          <h1>Library Catalog</h1>
          <p className="content__count">{filtered.length} books found</p>
        </div>

        <div className="content__search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search by title or author…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="content__empty">Loading…</p>
        ) : error ? (
          <p className="content__empty">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="content__empty">No books match your filters.</p>
        ) : (
          <>
            <div className="grid">
              {pageBooks.map((book) => (
                <BookCard key={book.id} book={book} user={user} onBorrow={handleBorrow} />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </main>
    </div>
  );
}

export default Catalog;
