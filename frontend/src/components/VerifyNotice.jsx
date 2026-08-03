import { useState } from "react";
import client from "../api/client";

// Баталгаажуулах холбоосыг дахин илгээх самбар.
// Register (бүртгэлийн дараа) болон SignIn (403 авсан үед) хоёулаа ашиглана.
//
// email — аль хаяг руу илгээхийг backend-д хэлнэ. Энэ endpoint нээлттэй
// (token шаардахгүй), учир нь баталгаажаагүй хэрэглэгчид token байдаггүй.
function VerifyNotice({ email }) {
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const resend = async () => {
    setSending(true);
    setNote("");
    setError("");
    try {
      const { data } = await client.post("/email/verification-notification", { email });
      setNote(data.message);
    } catch (err) {
      // 429 = throttle (минутад 5 удаа), бусад нь серверийн алдаа.
      setError(
        err.response?.status === 429
          ? "Хэт олон удаа оролдлоо. Нэг минутын дараа дахин үзнэ үү."
          : err.response?.data?.message ?? "Илгээхэд алдаа гарлаа."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify">
      <p className="verify__lead">
        Бид <strong>{email}</strong> хаяг руу баталгаажуулах холбоос илгээлээ.
      </p>
      <p className="verify__hint">
        Мэйл дэх товчийг дарж бүртгэлээ идэвхжүүлнэ үү. Холбоос 60 минутын дараа
        хүчингүй болно. Ирээгүй бол спам хавтсаа шалгаарай.
      </p>

      <button type="button" className="btn-block" onClick={resend} disabled={sending}>
        {sending ? "Илгээж байна…" : "Холбоосыг дахин илгээх"}
      </button>

      {note && <p className="verify__ok">{note}</p>}
      {error && <p className="verify__err">{error}</p>}
    </div>
  );
}

export default VerifyNotice;
