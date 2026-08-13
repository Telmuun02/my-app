import "./Pagination.css";

// Хуудаслалт: ‹ 1 2 3 › . page — идэвхтэй хуудас, totalPages — нийт хуудас.
// onPage(n) — App/Catalog-ийн page state-ийг өөрчилнө.
function Pagination({ page, totalPages, onPage }) {
  // Ганц хуудастай бол харуулах шаардлагагүй.
  if (totalPages <= 1) return null;

  // [1, 2, ..., totalPages] массив үүсгэнэ.
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
      >
        ‹
      </button>

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className={n === page ? "page-btn page-btn--active" : "page-btn"}
          onClick={() => onPage(n)}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
      >
        ›
      </button>
    </nav>
  );
}

export default Pagination;
