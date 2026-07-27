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

        {/* Номын зураг (одоохондоо бүх номд ижил placeholder) */}
        <img
          className="card__cover-img"
          src="https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg"
          alt={book.title}
          style={{
            width: "90px",
            height: "130px",
            objectFit: "cover",
            borderRadius: "4px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
          }}
        />

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
