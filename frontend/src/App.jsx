import { useState } from "react";
import Header from "./components/Header";
import Catalog from "./components/Catalog";
import SignIn from "./components/SignIn";
import Register from "./components/Register";
import EmailVerified from "./components/EmailVerified";
import client, { setToken, clearToken } from "./api/client";
import "./App.css";

// Хуудас дахин ачаалахад хэрэглэгч гарчихгүйн тулд localStorage-оос сэргээнэ.
function loadStoredUser() {
  const raw = localStorage.getItem("folio_user");
  return raw ? JSON.parse(raw) : null;
}

// Backend баталгаажуулсны дараа /email-verified?status=… руу redirect хийдэг.
// react-router байхгүй тул эхний ачаалалт дээр URL-ыг шууд шалгана.
function initialView() {
  return window.location.pathname === "/email-verified" ? "email-verified" : "catalog";
}

function App() {
  // Хайлт header ба каталог хоёрт хуваалцагдана.
  const [query, setQuery] = useState("");
  // Энгийн "router": одоо харагдаж буй хуудас.
  const [view, setView] = useState(initialView);
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
      {/* Register нь token авахаа больсон тул onAuth хэрэггүй — өөрөө
          "мэйлээ шалгана уу" дэлгэц рүү шилжинэ. */}
      {view === "register" && <Register onNavigate={setView} />}
      {view === "email-verified" && <EmailVerified onNavigate={setView} />}
    </div>
  );
}

export default App;
