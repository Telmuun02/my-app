import { useState } from "react";
import AuthLayout from "./AuthLayout";
import client from "../api/client";

// Нэвтрэх хуудас. handleSubmit нь backend-ийн /login endpoint-ыг дуудна.
function SignIn({ onNavigate, onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Амжилттай бол backend { user, token } буцаана.
      const { data } = await client.post("/login", form);
      onAuth(data); // App-д token хадгалж, каталог руу шилжинэ.
    } catch (err) {
      // Laravel алдааны мессежийг харуулна (422 = буруу нэвтрэлт).
      setError(err.response?.data?.message ?? "Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Folio account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <button type="button" className="auth__link" onClick={() => onNavigate("register")}>
            Register
          </button>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Email address</span>
          <input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input name="password" type="password" value={form.password} onChange={update} placeholder="••••••••" />
        </label>

        {/* Алдаа гарвал улаанаар харуулна */}
        {error && <p style={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</p>}

        <button type="submit" className="btn-block" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* Seed-ээр үүсгэсэн туршилтын бүртгэлүүд */}
        <div className="auth-demo">
          <p>Demo accounts (нууц үг: <code>password</code>):</p>
          <p><code>admin@example.com</code> → Admin</p>
          <p><code>test@example.com</code> → Member</p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default SignIn;
