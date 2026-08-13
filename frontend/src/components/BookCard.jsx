import { useState } from "react";
import { Link } from "react-router-dom";
import { CARD_BACKGROUND_URL, COVER_GRADIENTS } from "../data/books";
import "./BookCard.css";

// Нэг номын карт: өнгөт хавтас + доор нь мэдээлэл, availability, borrow товч.
// user — нэвтэрсэн эсэх (зээлэх товч идэвхжинэ). onBorrow(id) — зээлэх дуудалт.
//
// Хавтас/мэдээллийн хэсгийг дарахад /books/:id дэлгэрэнгүй хуудас руу орно.
// Footer (borrow товч) нь ЗОРИУДААР Link-ийн ГАДНА байна — товчийг линк дотор
// хийвэл дарах бүрд бас хуудас солигдох байсан.
function BookCard({ book, user, onBorrow }) {
  const isAvailable = book.available > 0;
  const cover = COVER_GRADIENTS[book.category] ?? "linear-gradient(160deg, #555, #222)";

  // Зураг ачаалагдаагүй бол <img>-ийг нуугаад доорх градиентыг ил гаргана.
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <article className="card">
      <Link to={`/books/${book.id}`} className="card__link">
        {/* Ном хавтас.
            Хоёр давхар background: дээр нь ангиллын градиент, дор нь Cloudinary
            дээрх зураг. multiply нь градиентын өнгөөр зургийг будаж холино —
            ингэснээр ангилал бүрийн өнгө хадгалагдаж, зураг ч мөн харагдана. */}
        <div
          className="book-cover card__cover"
          style={{
            backgroundImage: `${cover}, url(${CARD_BACKGROUND_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "multiply",
          }}
        >
          <span className="book-cover__category">{book.category}</span>

          {/* Номын зураг — URL нь backend-ээс (Cloudinary) ирнэ.
              Одоохондоо бүх ном ижил зурагтай; хэмжээ, формат Cloudinary тал дээр
              тохируулагдсан тул энд зөвхөн харуулна. */}
          {!coverFailed && book.cover_url && (
            <img
              className="book-cover__img card__cover-img"
              src={book.cover_url}
              alt={book.title}
              loading="lazy"
              onError={() => setCoverFailed(true)}
            />
          )}

          <div className="card__cover-text">
            <h3 className="card__cover-title">{book.title}</h3>
            <p className="book-cover__author">{book.author}</p>
          </div>
        </div>

        {/* Хавтасны доорх мэдээлэл */}
        <div className="card__body">
          <h3 className="card__title">{book.title}</h3>
          <p className="card__author">{book.author}</p>
          <span className="badge-outline">{book.category}</span>
        </div>
      </Link>

      {/* Footer: боломжтой тоо + borrow товч */}
      <div className="card__footer">
        <span className={isAvailable ? "pill pill--avail" : "pill pill--out"}>
          {isAvailable ? `${book.available} avail.` : "Checked out"}
        </span>
        {user ? (
          // Нэвтэрсэн үед: боломжтой бол зээлнэ
          <button
            type="button"
            className="btn-borrow"
            disabled={!isAvailable}
            onClick={() => onBorrow(book.id)}
          >
            {isAvailable ? "Borrow" : "Unavailable"}
          </button>
        ) : (
          // Нэвтрээгүй үед: идэвхгүй
          <button type="button" className="btn-borrow" disabled>
            Login to Borrow
          </button>
        )}
      </div>
    </article>
  );
}

export default BookCard;
