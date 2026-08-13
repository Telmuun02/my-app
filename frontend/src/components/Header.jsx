import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookIcon, SearchIcon } from "./icons";

// Дээд header: лого, дунд хайлтын талбар, баруун талд Sign in / Register.
// query, onQueryChange — хайлт (controlled input, App удирдана).
// Хуудас солих нь <Link> буюу URL-аар явна (өмнөх onNavigate prop хэрэггүй болсон).
// user — нэвтэрсэн хэрэглэгч (эсвэл null). onLogout — гарах.
function Header({ query, onQueryChange, user, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Хайлт зөвхөн каталог дээр утгатай. Өөр хуудсан дээр бичиж эхэлбэл
  // каталог руу буцаана — эс бөгөөс бичсэн зүйл нь хаана ч нөлөөлөхгүй.
  const handleSearch = (e) => {
    onQueryChange(e.target.value);
    if (pathname !== "/") navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        <span className="header__logo" aria-hidden="true">
          <BookIcon />
        </span>
        <span className="header__name">Folio</span>
      </Link>

      <div className="header__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search books, authors…"
          value={query}
          onChange={handleSearch}
        />
      </div>

      <div className="header__auth">
        {user ? (
          // Нэвтэрсэн үед: нэр + Sign out
          <>
            <span className="header__user">
              {user.company?.name ? `${user.company.name} · ${user.name}` : user.name}
            </span>
            <button type="button" className="btn-text" onClick={onLogout}>
              Sign out
            </button>
          </>
        ) : (
          // Нэвтрээгүй үед: Sign in / Register
          <>
            <Link to="/signin" className="btn-text">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
