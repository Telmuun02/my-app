import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import BookCard from "./BookCard";
import Pagination from "./Pagination";
import { SearchIcon } from "./icons";
import client from "../api/client";

// API-ийн ном → UI-д хэрэгтэй энгийн бүтэц рүү хөрвүүлэх.
// BookResource: { authors: ["Нэр"], category: "Нэр", available: N }
function normalizeBook(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.authors?.join(", ") || "Unknown",
    category: book.category ?? "Uncategorized",
    available: book.available,
  };
}

// Номын каталог. Одоо шүүлт/хайлт/pagination бүгд SERVER дээр хийгддэг —
// нэг хуудсанд ердөө 8 ном татна (бүх 108-ыг биш).
function Catalog({ query, onQueryChange, user }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Ангиллыг нэг удаа татна (өөрчлөгддөггүй).
  useEffect(() => {
    client
      .get("/categories")
      .then((res) => setCategories(res.data.map((c) => c.name)))
      .catch(() => {});
  }, []);

  // Ном: хуудас/шүүлт/хайлт өөрчлөгдөх бүрд server-ээс тухайн хуудсыг татна.
  useEffect(() => {
    let active = true;
    setLoading(true);

    // Шүүлт/хайлт/хуудсыг query параметр болгож илгээнэ (?page=..&category=..&search=..).
    const params = { page };
    if (category !== "all") params.category = category;
    if (availability !== "all") params.availability = availability;
    if (query.trim()) params.search = query.trim();

    client
      .get("/books", { params })
      .then((res) => {
        if (!active) return;
        setBooks(res.data.data.map(normalizeBook)); // тухайн хуудсын 8 ном
        setTotalPages(res.data.meta.last_page); // нийт хэдэн хуудас
        setTotalCount(res.data.meta.total); // нийт хэдэн ном (шүүлтийн дараа)
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
  }, [page, category, availability, query]);

  // Шүүлт/хайлт өөрчлөгдвөл эхний хуудас руу буцаана.
  useEffect(() => {
    setPage(1);
  }, [category, availability, query]);

  // Ном зээлэх: /loans руу POST, амжилттай бол локал available-ийг 1 бууруулна.
  const handleBorrow = async (bookId) => {
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
          <p className="content__count">{totalCount} books found</p>
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
        ) : books.length === 0 ? (
          <p className="content__empty">No books match your filters.</p>
        ) : (
          <>
            <div className="grid">
              {books.map((book) => (
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
