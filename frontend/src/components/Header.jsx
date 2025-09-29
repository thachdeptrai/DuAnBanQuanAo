import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">👕 MyClothingShop</Link>
      </div>

      <nav className="nav">
        <ul>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/shop">Sản phẩm</Link></li>
          <li><Link to="/cart">Giỏ hàng</Link></li>
          <li><Link to="/login">Đăng nhập</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
