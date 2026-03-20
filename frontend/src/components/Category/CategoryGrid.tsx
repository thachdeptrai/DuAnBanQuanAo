import React, { useState } from "react";
import type { Category as ApiCategory } from "../../NetWork/category.api";

interface Props {
  categories: ApiCategory[];
  onCategoryClick: (id: number) => void;
}

const VISIBLE_COUNT = 6; // số danh mục hiển thị ban đầu

const CategorySection: React.FC<Props> = ({
  categories = [],
  onCategoryClick,
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedCategories = showAll
    ? categories
    : categories.slice(0, VISIBLE_COUNT);

  return (
    <section className="container mx-auto px-6 py-16">
      {/* Title */}
      <div className="text-center mb-14">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
          Danh Mục Nổi Bật
        </h2>
        <p className="text-gray-500 text-lg">
          Lựa chọn theo nhu cầu của bạn
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
        {displayedCategories.length === 0 ? (
          <p className="text-gray-400">Chưa có danh mục nào</p>
        ) : (
          displayedCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="group w-[140px] flex flex-col items-center cursor-pointer"
            >
              {/* Image */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/60 via-pink-400/60 to-orange-400/60 blur opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg ring-4 ring-white transition-all duration-300 group-hover:scale-110">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <h3 className="mt-5 text-lg font-semibold text-gray-800 text-center transition-colors duration-300 group-hover:text-primary">
                {category.name}
              </h3>
            </div>
          ))
        )}
      </div>

      {/* View More */}
      {categories.length > VISIBLE_COUNT && (
        <div className="mt-14 text-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            {showAll ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
