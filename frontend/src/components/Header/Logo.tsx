import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo/Logo.png";

const Logo = ({ onReload }: { onReload?: () => void }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // 1. Scroll lên đầu trang
        window.scrollTo({ top: 0, behavior: "smooth" });

        // 2. Navigate về trang Home (nếu đang ở Home, vẫn trigger reload)
        navigate("/", { replace: false });

        // 3. Gọi callback để load dữ liệu mới (nếu được truyền)
        if (onReload) {
            onReload();
        }
    };

    return (
        <div
            style={{ width: "260px" }}
            className="flex items-center cursor-pointer"
            onClick={handleClick}
        >
            <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto object-contain md:h-24 lg:h-28"
            />
        </div>
    );
};

export default Logo;
