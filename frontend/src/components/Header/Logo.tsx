import React from "react";
import logo from "../../assets/logo/Logo.png";

interface LogoProps {
    onReload?: () => void;
}

const Logo: React.FC<LogoProps> = ({ onReload }) => {
    const handleClick = () => {
        // ✅ Chỉ cuộn trang lên đầu
        window.scrollTo({ top: 0, behavior: "smooth" });

        // ✅ Nếu có callback reload thì gọi (nếu bạn muốn xử lý thêm)
        onReload?.();
    };

    return (
        <div
            className="flex items-center cursor-pointer"
            style={{ width: "260px" }}
            onClick={handleClick}
        >
            <img
                src={logo}
                alt="Logo"
                className="h-20 md:h-24 lg:h-28 w-auto object-contain"
            />
        </div>
    );
};

export default Logo;
