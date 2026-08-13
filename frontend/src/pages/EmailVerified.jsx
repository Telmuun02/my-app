import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

// Мэйл дэх холбоосыг дарахад backend энэ хуудас руу redirect хийнэ:
//   http://localhost:5173/email-verified?status=success | already | error
//
// Backend-ийн EmailVerificationController::frontend() яг эдгээр утгыг илгээдэг.
const MESSAGES = {
  success: {
    title: "Баталгаажлаа",
    subtitle: "И-мэйл хаяг чинь амжилттай баталгаажлаа",
    text: "Одоо нэвтрээд ном зээлэх боломжтой боллоо.",
    tone: "ok",
  },
  already: {
    title: "Аль хэдийн баталгаажсан",
    subtitle: "Энэ хаяг өмнө нь баталгаажсан байна",
    text: "Шууд нэвтэрч болно.",
    tone: "ok",
  },
  error: {
    title: "Холбоос хүчингүй",
    subtitle: "Холбоосын хугацаа дууссан эсвэл буруу байна",
    text: "Нэвтрэх хуудсаар орж шинэ холбоос хүсэх боломжтой.",
    tone: "err",
  },
};

function EmailVerified() {
  // ?status=success | already | error — router-ийн hook-оор уншина.
  const [searchParams] = useSearchParams();
  const info = MESSAGES[searchParams.get("status")] ?? MESSAGES.error;

  return (
    <AuthLayout title={info.title} subtitle={info.subtitle}>
      <div className="verify">
        <p className={info.tone === "ok" ? "verify__ok" : "verify__err"}>{info.text}</p>

        {/* replace — түүхэн дэх /email-verified?status=… бичлэгийг СОЛИНО.
            Ингэснээр back дарахад баталгаажуулалтын хуудас руу буцахгүй. */}
        <Link to="/signin" replace className="btn-block" style={{ display: "block", textAlign: "center" }}>
          Нэвтрэх
        </Link>
      </div>
    </AuthLayout>
  );
}

export default EmailVerified;
