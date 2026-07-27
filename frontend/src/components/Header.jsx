import { BookIcon, SearchIcon } from "./icons";

// Дээд header: лого, дунд хайлтын талбар, баруун талд Sign in / Register.
// query, onQueryChange — хайлт (controlled input, App удирдана).
// onNavigate("catalog" | "signin" | "register") — хуудас солино.
// user — нэвтэрсэн хэрэглэгч (эсвэл null). onLogout — гарах.
function Header({ query, onQueryChange, onNavigate, user, onLogout }) {
  return (
    <header className="header">
      <button type="button" className="header__brand" onClick={() => onNavigate("catalog")}>
        <span className="header__logo" aria-hidden="true">
          <BookIcon />
        </span>
        <span className="header__name">Folio</span>
      </button>

      <div className="header__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search books, authors…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
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
            <button type="button" className="btn-text" onClick={() => onNavigate("signin")}>
              Sign in
            </button>
            <button type="button" className="btn-primary" onClick={() => onNavigate("register")}>
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
