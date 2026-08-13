import Rating from "@mui/material/Rating";
import "./BasicRating.css";

// Номын үнэлгээ (одоор). Controlled компонент — утгыг эцэг компонент эзэмшинэ.
//
// MUI-ийн Rating-ийг үлдээсэн шалтгаан: од дээр хулгана хөдлөх, гар (keyboard)
// -аар сонгох, screen reader-т зориулсан radio семантик зэргийг бэлнээр өгнө.
// Үүнийг гараар бичих нь нэлээд ажил. Харин demo дахь Box, Typography хоёрыг
// хассан — тэдгээр нь ердөө div/span байсан тул төслийн CSS-ээр хийв.
//
// readOnly=true — зөвхөн харуулна (жишээ нь бусдын өгсөн дундаж үнэлгээ).
function BasicRating({ label, value, onChange, readOnly = true, precision = 1 }) {
  return (
    <div className="rating">
      {label && <span className="rating__label">{label}</span>}

      <Rating
        name="book-rating"
        value={value ?? null}
        precision={precision}
        readOnly={readOnly}
        // MUI (event, newValue) дамжуулдаг — бидэнд зөвхөн утга нь хэрэгтэй.
        // Одоо сонгогдсон од дээр дахин дарвал newValue нь null ирнэ.
        onChange={(_event, newValue) => onChange?.(newValue)}
      />

      <span className="rating__value">{value ? `${value} / 5` : "Үнэлгээгүй"}</span>
    </div>
  );
}

export default BasicRating;
