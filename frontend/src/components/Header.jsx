import { Link, useLocation, useNavigate } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { BookIcon, SearchIcon } from "./icons";
import "./Header.css";

// Дээд header: лого, дунд хайлтын талбар, баруун талд сагс + Sign in / Register.
// query, onQueryChange — хайлт (controlled input, App удирдана).
// Хуудас солих нь <Link> буюу URL-аар явна (өмнөх onNavigate prop хэрэггүй болсон).
// user — нэвтэрсэн хэрэглэгч (эсвэл null). onLogout — гарах.
// cartCount — сагсан дахь номын тоо; 0 үед badge харагдахгүй.
// onCartClick — сагс дарахад (одоохондоо заавал биш).
function Header({ query, onQueryChange, user, onLogout, cartCount = 0, onCartClick }) {
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
        <span className="logo-badge header__logo" aria-hidden="true">
          <BookIcon />
        </span>
        <span className="header__name">Folio</span>
      </Link>

      <div className="search-box header__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search books, authors…"
          value={query}
          onChange={handleSearch}
        />
      </div>

      <div className="header__auth">
        {/* Сагс. Тоог MUI-ийн Badge-ээр биш, өөрсдийн CSS-ээр наана —
            хэрэгтэй нь ердөө "0 үед нуух" + булан дээр байрлуулах хоёр. */}
        <button
          type="button"
          className="header__cart"
          aria-label={`Сагс (${cartCount})`}
          onClick={onCartClick}
        >
          <AddShoppingCartIcon fontSize="small" />
          {cartCount > 0 && (
            <span className="header__cart-count">{cartCount > 99 ? "99+" : cartCount}</span>
          )}
        </button>

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
