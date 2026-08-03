import AuthLayout from "./AuthLayout";

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

function EmailVerified({ onNavigate }) {
  const status = new URLSearchParams(window.location.search).get("status");
  const info = MESSAGES[status] ?? MESSAGES.error;

  // Хаягийн мөрийг цэвэрлэнэ — эс бөгөөс refresh дарахад дахин энэ хуудас гарна.
  const goSignIn = () => {
    window.history.replaceState({}, "", "/");
    onNavigate("signin");
  };

  return (
    <AuthLayout title={info.title} subtitle={info.subtitle}>
      <div className="verify">
        <p className={info.tone === "ok" ? "verify__ok" : "verify__err"}>{info.text}</p>

        <button type="button" className="btn-block" onClick={goSignIn}>
          Нэвтрэх
        </button>
      </div>
    </AuthLayout>
  );
}

export default EmailVerified;
