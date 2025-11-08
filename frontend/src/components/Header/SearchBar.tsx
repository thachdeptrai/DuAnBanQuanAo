"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div ref={ref} className="relative flex items-center justify-end w-full md:w-auto">
            <AnimatePresence initial={false}>
                {!isOpen ? (
                    <motion.button
                        key="search-button"
                        onClick={() => setIsOpen(true)}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <Search className="w-5 h-5 text-gray-700" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="search-bar"
                        initial={{ width: "2.5rem", opacity: 0 }}
                        animate={{ width: "18rem", opacity: 1 }}
                        exit={{ width: "2.5rem", opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex items-center bg-white border-2 border-indigo-500 rounded-full shadow-sm px-3 py-2 relative"
                    >
                        <Search className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
                        />
                        <motion.button
                            onClick={() => {
                                setQuery("");
                                setIsOpen(false);
                            }}
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.2 }}
                            className="ml-2 p-1 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
