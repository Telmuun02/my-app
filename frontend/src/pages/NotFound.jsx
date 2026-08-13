import { Link } from "react-router-dom";

// Тодорхойлогдоогүй бүх URL энд ирнэ (App.jsx-ийн path="*").
function NotFound() {
  return (
    <div className="detail">
      <h1 className="detail__title">404</h1>
      <p className="content__empty">Ийм хуудас байхгүй байна.</p>
      <Link to="/" className="detail__back">
        ← Каталог руу буцах
      </Link>
    </div>
  );
}

export default NotFound;
