import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header";
// pages/ — route бүрт харгалзах "хуудас". components/ — тэдгээрийн доторх
// дахин ашиглагддаг жижиг хэсгүүд (Header, BookCard, Sidebar…).
import Catalog from "./pages/Catalog";
import BookDetail from "./pages/BookDetail";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import EmailVerified from "./pages/EmailVerified";
import NotFound from "./pages/NotFound";
import client, { setToken, clearToken } from "./api/client";
import "./App.css";

// Хуудас дахин ачаалахад хэрэглэгч гарчихгүйн тулд localStorage-оос сэргээнэ.
function loadStoredUser() {
  const raw = localStorage.getItem("folio_user");
  return raw ? JSON.parse(raw) : null;
}

function App() {
  // Хайлт header ба каталог хоёрт хуваалцагдана.
  const [query, setQuery] = useState("");
  // Нэвтэрсэн хэрэглэгч (эсвэл null).
  const [user, setUser] = useState(loadStoredUser);

  // Хуудас солих нь одоо URL-аар явна (өмнөх `view` state-ийн оронд).
  const navigate = useNavigate();

  // SignIn амжилттай болоход дуудагдана. data = { user, token }.
  const handleAuth = ({ user, token }) => {
    setToken(token);
    localStorage.setItem("folio_user", JSON.stringify(user));
    setUser(user);
    navigate("/");
  };

  // Гарах: backend дээрх token-ыг устгаад, локал төлвийг цэвэрлэнэ.
  const handleLogout = async () => {
    try {
      await client.post("/logout");
    } catch {
      // Token аль хэдийн хүчингүй байсан ч локалаас цэвэрлэхэд асуудалгүй.
    }
    clearToken();
    localStorage.removeItem("folio_user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="app">
      {/* Header бүх хуудсанд харагдана — Routes-ийн гадна байна. */}
      <Header query={query} onQueryChange={setQuery} user={user} onLogout={handleLogout} />

      {/* URL → компонент харгалзуулалт. Дээрээс доош тааруулахгүй, react-router
          хамгийн тохирох (specific) route-ыг өөрөө сонгоно. */}
      <Routes>
        <Route path="/" element={<Catalog query={query} onQueryChange={setQuery} user={user} />} />
        {/* :id — динамик хэсэг. BookDetail дотор useParams()-аар уншина. */}
        <Route path="/books/:id" element={<BookDetail user={user} />} />
        <Route path="/signin" element={<SignIn onAuth={handleAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        {/* Дээрхийн аль нь ч таарахгүй бол */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
