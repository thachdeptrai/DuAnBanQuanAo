import React from "react";
import { Gift, Zap } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface NavMenuProps {
  categories?: Category[];
  onCategoryClick: (id: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ categories = [], onCategoryClick }) => {
  const defaultMenuItems = [
    { id: "new", name: "Mới Nhất", icon: Zap },
    { id: "sale", name: "Sale Off", icon: Gift },
  ];

  return (
    <nav className="container mx-auto px-6 py-3">
      <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
        {defaultMenuItems.map(({ id, name, icon: Icon }) => (
          <li key={id}>
            <button
              onClick={() => onCategoryClick(id)}
              className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 font-medium transition-all hover:scale-110 group"
            >
              <Icon className="w-4 h-4 group-hover:animate-pulse" />
              <span>{name}</span>
            </button>
          </li>
        ))}

        {categories.map(({ id, name }) => (
          <li key={id}>
            <button
              onClick={() => onCategoryClick(id)}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-all hover:scale-110"
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavMenu;
