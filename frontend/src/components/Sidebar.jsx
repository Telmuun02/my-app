// Зүүн талын шүүлтүүр: Ангилал ба Боломж (availability).
// categories нь backend-ээс ирсэн ангиллын нэрсийн жагсаалт (Catalog дамжуулна).
// Идэвхтэй утга бүрийг App/Catalog удирдана.
const AVAILABILITY = [
  { value: "all", label: "All Books" },
  { value: "available", label: "Available" },
  { value: "checked-out", label: "Checked Out" },
];

function Sidebar({ categories, category, onCategory, availability, onAvailability }) {
  return (
    <aside className="sidebar">
      <FilterGroup title="Category">
        <FilterItem
          label="All Categories"
          active={category === "all"}
          onClick={() => onCategory("all")}
        />
        {categories.map((c) => (
          <FilterItem
            key={c}
            label={c}
            active={category === c}
            onClick={() => onCategory(c)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        {AVAILABILITY.map((a) => (
          <FilterItem
            key={a.value}
            label={a.label}
            active={availability === a.value}
            onClick={() => onAvailability(a.value)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="filter-group">
      <p className="filter-group__title">{title}</p>
      <ul className="filter-list">{children}</ul>
    </div>
  );
}

function FilterItem({ label, active, onClick }) {
  return (
    <li>
      <button
        type="button"
        className={active ? "filter-item filter-item--active" : "filter-item"}
        onClick={onClick}
      >
        {label}
      </button>
    </li>
  );
}

export default Sidebar;
