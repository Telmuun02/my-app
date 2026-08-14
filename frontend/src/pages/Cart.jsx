import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import "./Cart.css";

// Миний зээлсэн номууд — URL: /cart
//
// Өгөгдөл нь GET /api/loans-оос ирнэ. Хэрэглэгчийн id-г ДАМЖУУЛАХГҮЙ:
// backend нь Authorization токеноос хэн болохыг мэдээд, зөвхөн тухайн хүний
// зээллэгийг буцаадаг (LoanController::index). Клиентээс ирсэн id-д итгэвэл
// хэн ч дурын дугаар бичээд бусдын өгөгдлийг уншиж чадна.

// Өнөөдрийн огноо "YYYY-MM-DD" хэлбэрээр (орон нутгийн цагаар).
// toISOString() нь UTC тул шөнө дунд орчимд нэг өдрөөр зөрж болзошгүй.
function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Зээллэгийн төлөв: буцаагдсан / хугацаа хэтэрсэн / идэвхтэй.
// "YYYY-MM-DD" хэлбэрийн огноог мөрөөр харьцуулж болно — форматын дараалал нь
// он → сар → өдөр тул цагаан толгойн эрэмбэ нь цаг хугацааны эрэмбэтэй таарна.
function loanStatus(loan) {
  if (loan.return_date) return { label: "Буцаагдсан", cls: "pill pill--out" };
  if (loan.due_date < todayString()) return { label: "Хугацаа хэтэрсэн", cls: "pill pill--late" };
  return { label: "Зээлсэн", cls: "pill pill--avail" };
}

function Cart({ user }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Нэвтрээгүй бол дуудах утгагүй — 401 авахаас өмнө зогсооно.
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    client
      .get("/loans")
      .then((res) => {
        if (!active) return;
        setLoans(res.data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.status === 401
            ? "Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү."
            : "Зээллэгийн мэдээлэл ачаалж чадсангүй."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  // Нэвтрээгүй үед
  if (!user) {
    return (
      <div className="page">
        <Link to="/" className="back-link">
          ← Каталог руу буцах
        </Link>
        <h1 className="page__title">Миний зээлсэн номууд</h1>
        <p className="empty-state">Зээллэгээ харахын тулд нэвтэрнэ үү.</p>
        <Link to="/signin" className="btn-primary">
          Нэвтрэх
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Каталог руу буцах
      </Link>

      <h1 className="page__title">Миний зээлсэн номууд</h1>

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : loans.length === 0 ? (
        <>
          <p className="empty-state">Одоогоор зээлсэн ном алга.</p>
          {/* Зээл нь queue-гээр боловсруулагддаг (POST /loans → 202 Accepted)
              тул дөнгөж зээлсэн ном шууд гарч ирэхгүй байж болно. */}
          <p className="loans__hint">
            Саяхан зээлсэн бол хэдэн секундын дараа хуудсаа сэргээж үзээрэй.
          </p>
        </>
      ) : (
        <ul className="loans">
          {loans.map((loan) => {
            const status = loanStatus(loan);

            return (
              <li key={loan.id} className="loans__row">
                <div className="loans__main">
                  {/* Зээллэгийн дугаар — лавлагааны дугаар. Хэрэглэгч
                      админтай холбогдоход "#42-той зээллэг" гэж хэлэх, эсвэл
                      log-оос хайхад ашиглана. */}
                  <span className="loans__id">#{loan.id}</span>

                  <Link to={`/books/${loan.book_id}`} className="loans__title">
                    {loan.book?.title ?? "Ном"}
                  </Link>

                  {/* Админ дансаар бүх хүний зээллэг ирдэг тул өөрийнх биш
                      бол хэн зээлснийг харуулна. */}
                  {loan.user_id !== user.id && loan.user?.name && (
                    <span className="loans__owner">{loan.user.name}</span>
                  )}
                </div>

                <dl className="loans__dates">
                  <div>
                    <dt>Зээлсэн</dt>
                    <dd>{loan.loan_date}</dd>
                  </div>
                  <div>
                    <dt>Буцаах</dt>
                    <dd>{loan.due_date}</dd>
                  </div>
                </dl>

                <span className={status.cls}>{status.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Cart;
