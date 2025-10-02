import { Gift, Zap } from "lucide-react";
import React from "react";

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
      <ul className="flex items-center justify-center space-x-8 flex-wrap">
        {defaultMenuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onCategoryClick(item.id)}
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium transition-all hover:scale-110 group"
            >
              {item.icon && <item.icon className="w-4 h-4 group-hover:animate-pulse" />}
              <span>{item.name}</span>
            </button>
          </li>
        ))}

        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onCategoryClick(category.id)}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-all hover:scale-110"
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavMenu;
