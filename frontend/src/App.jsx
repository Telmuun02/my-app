import { useState } from "react";
import Header from "./components/Header";
import Catalog from "./components/Catalog";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
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
  // Энгийн "router": одоо харагдаж буй хуудас.
  const [view, setView] = useState("catalog");
  // Нэвтэрсэн хэрэглэгч (эсвэл null).
  const [user, setUser] = useState(loadStoredUser);

  // SignIn / Register амжилттай болоход дуудагдана. data = { user, token }.
  const handleAuth = ({ user, token }) => {
    setToken(token);
    localStorage.setItem("folio_user", JSON.stringify(user));
    setUser(user);
    setView("catalog");
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
    setView("catalog");
  };

  return (
    <div className="app">
      <Header
        query={query}
        onQueryChange={setQuery}
        onNavigate={setView}
        user={user}
        onLogout={handleLogout}
      />

      {view === "catalog" && <Catalog query={query} onQueryChange={setQuery} user={user} />}
      {view === "signin" && <SignIn onNavigate={setView} onAuth={handleAuth} />}
      {view === "register" && <Register onNavigate={setView} onAuth={handleAuth} />}
    </div>
  );
}

export default App;
