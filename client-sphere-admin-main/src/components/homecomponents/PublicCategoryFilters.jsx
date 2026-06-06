export default function PublicCategoryFilters({
  categories,
  subCategories = [],
  activeCategory,
  activeSubCategory,
  onCategoryChange,
  onSubCategoryChange,
}) {
  const showSubCategories =
    activeCategory !== "All" &&
    subCategories.length > 0 &&
    typeof onSubCategoryChange === "function";

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto border-b pb-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={`pb-2 whitespace-nowrap text-sm ${
              activeCategory === c
                ? "border-b-2 border-purple-600 text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {showSubCategories && (
        <div className="flex gap-2 flex-wrap">
          {subCategories.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => onSubCategoryChange(sub)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                activeSubCategory === sub
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
