import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ProductGrid from "../components/Product/ProductGrid";
import Profile from "../components/Profile/Profle";

const ProfilePage: React.FC = () => {

    return (
        <div className="min-h-screen bg-white">
            <Header /> {/* Will now appear */}
            <Profile />
            <ProductGrid />
            <Footer /> {/* Will now appear */}
        </div>
    );
};

export default ProfilePage;
