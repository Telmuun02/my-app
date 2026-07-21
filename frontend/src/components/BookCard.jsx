import { COVER_GRADIENTS } from "../data/books";

// Нэг номын карт: өнгөт хавтас + доор нь мэдээлэл, availability, borrow товч.
// user — нэвтэрсэн эсэх (зээлэх товч идэвхжинэ). onBorrow(id) — зээлэх дуудалт.
function BookCard({ book, user, onBorrow }) {
  const isAvailable = book.available > 0;
  const cover = COVER_GRADIENTS[book.category] ?? "linear-gradient(160deg, #555, #222)";

  return (
    <article className="card">
      {/* Ном хавтас */}
      <div className="card__cover" style={{ background: cover }}>
        <span className="card__cover-category">{book.category}</span>

        {/* Бүдэг ном icon (чимэглэл) */}
        <svg className="card__cover-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 6c-1.5-1-4-1.5-6-1.5S2.5 5 2 5.5v13c.5-.5 2.5-1 4-1s4.5.5 6 1.5c1.5-1 4-1.5 6-1.5s3.5.5 4 1v-13c-.5-.5-2.5-1-4-1s-4.5.5-6 1.5Z" />
          <path d="M12 6v13" />
        </svg>

        <div className="card__cover-text">
          <h3 className="card__cover-title">{book.title}</h3>
          <p className="card__cover-author">{book.author}</p>
        </div>
      </div>

      {/* Хавтасны доорх мэдээлэл */}
      <div className="card__body">
        <h3 className="card__title">{book.title}</h3>
        <p className="card__author">{book.author}</p>
        <span className="card__badge">{book.category}</span>
      </div>

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
