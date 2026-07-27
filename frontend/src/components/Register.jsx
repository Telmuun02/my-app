import { useState } from "react";
import AuthLayout from "./AuthLayout";
import client from "../api/client";

// Бүртгүүлэх хуудас. handleSubmit нь backend-ийн /register endpoint-ыг дуудна.
// Анхаар: backend "confirmed" дүрэмтэй тул password_confirmation талбар шаардана.
function Register({ onNavigate, onAuth }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company_id: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Нэг handler-аар бүх талбарыг шинэчилнэ (input-ийн name-ээр).
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Амжилттай бол backend { user, token } буцаана (201).
      const { data } = await client.post("/register", form);
      onAuth(data); // App-д token хадгалж, каталог руу шилжинэ.
    } catch (err) {
      setError(err.response?.data?.message ?? "Бүртгэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Folio and start borrowing"
      footer={
        <>
          Already have an account?{" "}
          <button type="button" className="auth__link" onClick={() => onNavigate("signin")}>
            Sign in
          </button>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Full name</span>
          <input name="name" value={form.name} onChange={update} placeholder="Alex Chen" />
        </label>

        <label className="field">
          <span className="field__label">Email address</span>
          <input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" />
        </label>

        <label className="field">
          <span className="field__label">Company ID</span>
          <input name="company_id" type="number" value={form.company_id} onChange={update} placeholder="3" />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input name="password" type="password" value={form.password} onChange={update} placeholder="••••••••" />
        </label>

        <label className="field">
          <span className="field__label">Confirm password</span>
          <input
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={update}
            placeholder="••••••••"
          />
        </label>

        {error && <p style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</p>}

        <button type="submit" className="btn-block" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
