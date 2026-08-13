// Түр зуурын mock дата.
// Backend (Laravel API) бэлэн болмогц энэ файлыг client.get("/books") зэргээр
// солиход App.jsx-ийн бусад хэсэг бараг өөрчлөгдөхгүй.

// Ангилал бүрийн ном хавтасны өнгө (gradient).
// Sidebar болон карт хоёр ижил түлхүүр ашиглана.
export const CATEGORIES = [
  "Fiction",
  "Mystery",
  "Science Fiction",
  "History",
  "Philosophy",
  "Memoir",
  "Science",
];

// Картын хавтасны ард харагдах зураг (Cloudinary дээр folio/card-background).
// URL доторх хувиргалтууд: ar_3:4 нь .card__cover-ийн aspect-ratio-той таарна,
// f_auto/q_auto нь формат, чанарыг хөтчид тохируулж хэмжээг багасгана.
export const CARD_BACKGROUND_URL =
  "https://res.cloudinary.com/dv0hxjoqv/image/upload/w_600,ar_3:4,c_fill,f_auto,q_auto/folio/card-background";

export const COVER_GRADIENTS = {
  Fiction: "linear-gradient(160deg, #7a4325, #3d2417)",
  Mystery: "linear-gradient(160deg, #3a4a63, #1f2a3c)",
  "Science Fiction": "linear-gradient(160deg, #35566b, #1c2f3a)",
  History: "linear-gradient(160deg, #6a5a34, #362f1c)",
  Philosophy: "linear-gradient(160deg, #4a3a63, #26203c)",
  Memoir: "linear-gradient(160deg, #6b3040, #371822)",
  Science: "linear-gradient(160deg, #2f5a55, #17302d)",
};

export const BOOKS = [
  { id: 1, title: "The Name of the Rose", author: "Umberto Eco", category: "Mystery", available: 2 },
  { id: 2, title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", category: "Fiction", available: 4 },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: 3 },
  { id: 4, title: "The Midnight Library", author: "Matt Haig", category: "Fiction", available: 1 },
  { id: 5, title: "Dune", author: "Frank Herbert", category: "Science Fiction", available: 5 },
  { id: 6, title: "Meditations", author: "Marcus Aurelius", category: "Philosophy", available: 2 },
  { id: 7, title: "Educated", author: "Tara Westover", category: "Memoir", available: 0 },
  { id: 8, title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", available: 3 },
  { id: 9, title: "The Silent Patient", author: "Alex Michaelides", category: "Mystery", available: 0 },
  { id: 10, title: "1984", author: "George Orwell", category: "Fiction", available: 6 },
  { id: 11, title: "Cosmos", author: "Carl Sagan", category: "Science", available: 2 },
  { id: 12, title: "The Republic", author: "Plato", category: "Philosophy", available: 1 },
];
