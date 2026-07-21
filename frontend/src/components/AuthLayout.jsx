import { BookIcon } from "./icons";

// Sign in / Register хоёр ижил хэлбэртэй тул дундын бүрхүүл гаргав.
// title, subtitle — дээд текст. children — форм. footer — доод холбоос.
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__logo" aria-hidden="true">
        <BookIcon size={26} />
      </div>
      <h1 className="auth__title">{title}</h1>
      <p className="auth__subtitle">{subtitle}</p>

      <div className="auth__card">{children}</div>

      <p className="auth__footer">{footer}</p>
    </div>
  );
}

export default AuthLayout;
