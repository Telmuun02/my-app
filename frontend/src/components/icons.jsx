// Олон газар давтагддаг SVG icon-уудыг нэг дороос экспортолно.

export function BookIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 6c-1.5-1-4-1.5-6-1.5S2.5 5 2 5.5v13c.5-.5 2.5-1 4-1s4.5.5 6 1.5c1.5-1 4-1.5 6-1.5s3.5.5 4 1v-13c-.5-.5-2.5-1-4-1s-4.5.5-6 1.5Z" />
      <path d="M12 6v13" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
