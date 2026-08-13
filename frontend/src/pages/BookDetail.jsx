import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CARD_BACKGROUND_URL, COVER_GRADIENTS } from "../data/books";
import client from "../api/client";
import "./BookDetail.css";
import BasicRating from "../components/BasicRating";

// Нэг номын дэлгэрэнгүй хуудас — URL: /books/:id
//
// Анхаар: backend-ийн BookController::show() нь BookResource БИШ, харин
// загварыг шууд буцаадаг (available_copies, total_copies, isbn, category нь
// объект...). Тиймээс жагсаалтын хэлбэрээс өөр — энд нэг дор хөрвүүлж авна.
function normalizeBook(book) {
  return {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    category: book.category?.name ?? "Uncategorized",
    authors: (book.authors ?? []).map((a) => a.name),
    // ?? — index (BookResource) ба show (загвар) хоёрын аль ч хэлбэрийг дэмжинэ
    available: book.available_copies ?? book.available ?? 0,
    total: book.total_copies,
    cover_url: book.cover_url ?? null,
  };
}

function BookDetail({ user }) {
  // /books/42 → { id: "42" }. Тэмдэгт мөр гэдгийг анхаар (тоо биш).
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Зээлэх үйлдлийн төлөв
  const [borrowing, setBorrowing] = useState(false);
  const [message, setMessage] = useState("");

  // Үнэлгээ. АНХААР: backend-д одоогоор rating endpoint байхгүй тул энэ нь
  // зөвхөн локал төлөв — хуудас сэргээхэд алга болно.
  const [rating, setRating] = useState(null);

  // id өөрчлөгдөх бүрд (өөр ном руу шилжихэд) дахин татна.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage("");
    // Өөр ном руу шилжихэд компонент дахин mount хийгддэггүй (зөвхөн :id
    // солигддог) тул өмнөх номын үнэлгээ үлдэхээс сэргийлж цэвэрлэнэ.
    setRating(null);

    client
      .get(`/books/${id}`)
      .then((res) => {
        if (!active) return;
        setBook(normalizeBook(res.data));
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        // 404 — ийм id-тай ном байхгүй. Бусад тохиолдолд сүлжээ/сервер алдаа.
        setError(
          err.response?.status === 404
            ? "Ийм ном олдсонгүй."
            : "Мэдээлэл ачаалж чадсангүй. Backend асаалттай юу?"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Хариу ирэхээс өмнө хуудас солигдвол setState хийхгүй байх хамгаалалт.
    return () => {
      active = false;
    };
  }, [id]);

  const handleBorrow = async () => {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const dueDate = due.toISOString().slice(0, 10);

    setBorrowing(true);
    setMessage("");
    try {
      await client.post("/loans", { book_id: book.id, due_date: dueDate });
      // Серверээс дахин татахгүйгээр локал тоогоо шинэчилнэ.
      setBook((prev) => ({ ...prev, available: prev.available - 1 }));
      setMessage(`Зээллээ. Буцаах хугацаа: ${dueDate}`);
    } catch (err) {
      setMessage(err.response?.data?.message ?? "Зээлэхэд алдаа гарлаа.");
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p className="empty-state">{error}</p>
        <Link to="/" className="back-link">
          ← Каталог руу буцах
        </Link>
      </div>
    );
  }

  const isAvailable = book.available > 0;
  const cover = COVER_GRADIENTS[book.category] ?? "linear-gradient(160deg, #555, #222)";

  return (
    <div className="page">
      {/* Link — хөтчийн back биш, каталог руу шууд. Хэрэглэгч гаднаас шууд
          /books/42 руу орсон байж болох тул back(-1) найдвартай биш. */}
      <Link to="/" className="back-link">
        ← Каталог руу буцах
      </Link>

      <div className="detail__grid">
        {/* Зүүн тал: том хавтас (картынхтай ижил градиент + зураг) */}
        <div
          className="book-cover detail__cover"
          style={{
            backgroundImage: `${cover}, url(${CARD_BACKGROUND_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "multiply",
          }}
        >
          <span className="book-cover__category">{book.category}</span>
          {book.cover_url && (
            <img
              className="book-cover__img detail__cover-img"
              src={book.cover_url}
              alt={book.title}
            />
          )}
          <div>
            <h2 className="detail__cover-title">{book.title}</h2>
            <p className="book-cover__author">{book.authors.join(", ") || "Unknown"}</p>
          </div>
        </div>

        {/* Баруун тал: мэдээлэл */}
        <div className="detail__info">
          <span className="badge-outline">{book.category}</span>
          <h1 className="detail__title">{book.title}</h1>
          <p className="detail__authors">{book.authors.join(", ") || "Unknown author"}</p>

          <BasicRating label="Үнэлгээ" value={rating} onChange={setRating} />

          <dl className="detail__meta">
            <div className="detail__row">
              <dt>ISBN</dt>
              <dd>{book.isbn ?? "—"}</dd>
            </div>
            <div className="detail__row">
              <dt>Нийт хувь</dt>
              <dd>{book.total ?? "—"}</dd>
            </div>
            <div className="detail__row">
              <dt>Боломжтой</dt>
              <dd>{book.available}</dd>
            </div>
          </dl>

          <div className="detail__actions">
            <span className={isAvailable ? "pill pill--avail" : "pill pill--out"}>
              {isAvailable ? `${book.available} avail.` : "Checked out"}
            </span>

            {user ? (
              <button
                type="button"
                className="btn-primary"
                disabled={!isAvailable || borrowing}
                onClick={handleBorrow}
              >
                {borrowing ? "Зээлж байна…" : isAvailable ? "Borrow" : "Unavailable"}
              </button>
            ) : (
              // Нэвтрээгүй бол зээлэх боломжгүй — нэвтрэх хуудас руу заана.
              <Link to="/signin" className="btn-primary">
                Login to Borrow
              </Link>
            )}
          </div>

          {message && <p className="notice-ok detail__message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
