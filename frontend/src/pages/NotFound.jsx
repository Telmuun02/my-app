import { Link } from "react-router-dom";
import "./NotFound.css";

// Тодорхойлогдоогүй бүх URL энд ирнэ (App.jsx-ийн path="*").
function NotFound() {
  return (
    <div className="page">
      <h1 className="notfound__code">404</h1>
      <p className="empty-state">Ийм хуудас байхгүй байна.</p>
      <Link to="/" className="back-link">
        ← Каталог руу буцах
      </Link>
    </div>
  );
}

export default NotFound;
