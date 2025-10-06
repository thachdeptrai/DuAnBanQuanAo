import React from "react";
import logo from "../../assets/logo.png";

const Logo = () => (
    <div style={{ width: "260px" }} className="flex items-center">
        <img
            src={logo}
            alt="Logo"
            className="h-20 w-auto object-contain md:h-24 lg:h-28"
        />
    </div>
);

export default Logo;
