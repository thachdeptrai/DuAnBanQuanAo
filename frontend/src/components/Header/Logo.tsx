import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo/Logo.png";

const Logo = ({ onReload }: { onReload?: () => void }) => {
    // Không cần dùng useNavigate nữa nếu chỉ cuộn trang. 
    // Tôi giữ lại nó nếu bạn có kế hoạch dùng nó sau này, nhưng nó không cần thiết cho logic hiện tại.
    // const navigate = useNavigate(); 

    const handleClick = () => {
        // 1. Scroll lên đầu trang hiện tại
        // window.scrollTo({ top: 0, behavior: "smooth" }) sẽ cuộn trang hiện tại lên đầu
        window.scrollTo({ top: 0, behavior: "smooth" });

        // 2. 💡 ĐÃ LOẠI BỎ: Loại bỏ dòng navigate("/", ...) để không chuyển trang.
        // navigate("/", { replace: false }); 

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