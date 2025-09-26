import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
  Star,
  Heart,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const YodyHomepage = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Data từ thực tế YODY
  const bannerSlides = [
    {
      id: 1,
      desktop:
        "https://buggy.yodycdn.com/images/home-banner-dt/3a9a5531bf3fcd02c7fc282d28d4b4ea.webp",
      mobile:
        "https://buggy.yodycdn.com/images/home-banner-mb/f202d7c246f5d160b453677ce38a70d1.webp",
      link: "/collection/he-ruc-ro-sale-cuc-cang?page=1&sort=price_asc",
      alt: "Hè rực rỡ - Sale cực căng",
    },
    {
      id: 2,
      desktop:
        "https://buggy.yodycdn.com/images/home-banner-dt/7caecde446019b5512ae8f9c830fda96.webp",
      mobile:
        "https://buggy.yodycdn.com/images/home-banner-mb/3d9be211f41fa8466eb3fe61caaff244.webp",
      link: "/collection/gia-chua-tung-co?page=1&sort=price_asc",
      alt: "Giá chưa từng có",
    },
    {
      id: 3,
      desktop:
        "https://buggy.yodycdn.com/images/home-banner-dt/8447d30a435aa5049dfa0904fc1ae9c7.webp",
      mobile:
        "https://buggy.yodycdn.com/images/home-banner-mb/e621d8637ebffa188da2a6dd3dbbae17.webp",
      link: "/collection/ao-khoac",
      alt: "Áo khoác",
    },
  ];

  const poloCollection = [
    {
      id: 1,
      type: "video",
      src: "https://buggy.yodycdn.com/videos/raw/ce0bd71746e99929d7a1e5a5661272d1.mp4",
      link: "https://landing.yody.vn/polo-cool-2025",
    },
    {
      id: 2,
      type: "image",
      src: "https://buggy.yodycdn.com/images/home-carousel-dt/d4e7e85a185846a4a518151989ca0cc1.webp",
      link: "https://landing.yody.vn/polo-cool-2025",
    },
    {
      id: 3,
      type: "image",
      src: "https://buggy.yodycdn.com/images/home-carousel-dt/9daf3e3644722087a94c1f56f82d482d.webp",
      link: "https://landing.yody.vn/polo-cool-2025",
    },
    {
      id: 4,
      type: "image",
      src: "https://buggy.yodycdn.com/images/home-carousel-dt/ef7e6afe0e588e923e88475181063a0d.webp",
      link: "https://landing.yody.vn/polo-cool-2025",
    },
  ];

  const featuredCollections = [
    {
      id: 1,
      name: "BST Peaceful",
      image:
        "https://buggy.yodycdn.com/images/home-grid-dt/8c7b81636f1de2272713b5a1bc260ce6.webp",
      link: "/collection/bst-peaceful",
    },
    {
      id: 2,
      name: "YODY Sport nhẹ tẻnh",
      image:
        "https://buggy.yodycdn.com/images/home-grid-dt/13c3ce1e479832518aac5939f8e72202.webp",
      link: "/collection/yody-sport-nhe-tenh",
    },
    {
      id: 3,
      name: "Công nghệ CoolTouch",
      image:
        "https://buggy.yodycdn.com/images/home-grid-dt/f93127109a0bc034758a74c7c167cae2.webp",
      link: "/collection/cong-nghe-cooltouch",
    },
    {
      id: 4,
      name: "BST Business Casual 2025",
      image:
        "https://buggy.yodycdn.com/images/home-grid-dt/cdd198c0e21ee06416b59566e5191221.webp",
      link: "/collection/bst-business-casual-2025",
    },
  ];

  const blogPosts = [
    {
      id: 1,
      desktop:
        "https://buggy.yodycdn.com/images/home-banner-dt/79600370418107df41cc0bbd7b682d0f.webp",
      mobile:
        "https://buggy.yodycdn.com/images/home-banner-mb/38aa9673d710a112e43f69b159649917.webp",
      link: "/post/follow-zalo-oa-yody-nhan-ngay-qua-tang-mien-phi",
    },
    {
      id: 2,
      desktop:
        "https://buggy.yodycdn.com/images/home-banner-dt/8347af1da9345fa7829be5360497fad4.webp",
      mobile:
        "https://buggy.yodycdn.com/images/home-banner-mb/49ca86f322e77d64c3339a21162cdd60.webp",
      link: "/post/yody-phuc-vu-het-long-khach-hang-danh-gia-het-minh",
    },
    {
      id: 3,
      desktop:
        "https://buggy.yodycdn.com/images/home-banner-dt/850d63b3964ca7837cf28647145fa96b.webp",
      mobile:
        "https://buggy.yodycdn.com/images/home-banner-mb/537838cb481850b92b9c2a1ebc2d04f4.webp",
      link: "/post/yody-jeans-vua-van-tung-duong-cong",
    },
  ];
  const categories = [
    {
      name: "Nam",
      subcategories: [
        { name: "Áo khoác nam", img: "https://picsum.photos/60?random=1" },
        { name: "Áo nam", img: "https://picsum.photos/60?random=2" },
        { name: "Quần nam", img: "https://picsum.photos/60?random=3" },
        { name: "Đồ thể thao nam", img: "https://picsum.photos/60?random=4" },
        {
          name: "Đồ mặc trong & Đồ lót nam",
          img: "https://picsum.photos/60?random=5",
        },
      ],
    },
    {
      name: "Nữ",
      subcategories: [
        { name: "Áo khoác nữ", img: "https://picsum.photos/60?random=6" },
        { name: "Áo nữ", img: "https://picsum.photos/60?random=7" },
        { name: "Quần nữ", img: "https://picsum.photos/60?random=8" },
        { name: "Đồ thể thao nữ", img: "https://picsum.photos/60?random=9" },
        {
          name: "Đồ mặc trong & Đồ lót nữ",
          img: "https://picsum.photos/60?random=10",
        },
      ],
    },
    {
      name: "Trẻ em",
      subcategories: [
        { name: "Áo khoác trẻ em", img: "https://picsum.photos/60?random=11" },
        { name: "Áo trẻ em", img: "https://picsum.photos/60?random=12" },
        { name: "Quần trẻ em", img: "https://picsum.photos/60?random=13" },
        {
          name: "Đồ mặc trong trẻ em",
          img: "https://picsum.photos/60?random=14",
        },
        { name: "Sản phẩm khác", img: "https://picsum.photos/60?random=15" },
      ],
    },
  ];

  // Auto slide for banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="sticky top-0 p-3 z-[60] border-b border-b-border-primary bg-white transition-all duration-300 ease-linear max-w-screen-sm mx-auto lg:max-w-full lg:px-12 lg:py-4"
        style={{ backgroundColor: "transparent", borderColor: "transparent" }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <a
            aria-label="go home"
            href="/"
            className="lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            <img
              alt="logo"
              loading="lazy"
              className="h-8 min-h-8 min-w-fit"
              height="32"
              src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='33'%20fill='none'%3e%3cpath%20fill='%232A2A86'%20d='M30.18%2020.503a3.98%203.98%200%200%201-3.636-2.34%203.97%203.97%200%200%201%20.652-4.27%203.98%203.98%200%200%201%204.17-1.15%203.98%203.98%200%200%201%202.758%203.328h3.996a7.95%207.95%200%200%200-2.571-5.405%207.98%207.98%200%200%200-11.104.32%207.95%207.95%200%200%200%200%2011.09%207.977%207.977%200%200%200%2011.104.32%207.95%207.95%200%200%200%202.57-5.405h-3.98a3.97%203.97%200%200%201-1.31%202.509%203.98%203.98%200%200%201-2.649%201.003M16.606%209.047v7.742c0%202.026-1.764%203.667-3.75%203.667s-3.765-1.648-3.765-3.667V9.047H5.334v7.742c0%201.008.195%202.006.573%202.937.378.93.932%201.777%201.63%202.489a7.5%207.5%200%200%200%202.441%201.663%207.4%207.4%200%200%200%202.879.583c1.433%200%202.536-.372%203.749-1.505v1.528c0%202.026-1.564%203.667-3.75%203.667-2.184%200-3.92-1.645-3.92-3.667H5.334A7.75%207.75%200%200%200%207.58%2029.83a7.45%207.45%200%200%200%205.276%202.204%207.45%207.45%200%200%200%205.275-2.204%207.75%207.75%200%200%200%202.246-5.345V9.061z'/%3e%3cpath%20fill='%23FCAF17'%20d='M68.896%209.047v8.04c0%202.103-1.868%203.807-3.97%203.807s-3.987-1.708-3.987-3.807v-8.04h-3.978v8.04a7.97%207.97%200%200%200%204.917%207.361c.967.4%202.002.607%203.048.606%201.518%200%202.685-.386%203.97-1.563v1.587c0%202.103-1.656%203.807-3.97%203.807s-4.151-1.708-4.151-3.807h-3.814a7.963%207.963%200%200%200%2015.928%200V9.062zM51.854.916v9.033a7%207%200%200%200-4.132-1.38c-4.202%200-7.618%203.383-7.853%207.64h4.025a4.08%204.08%200%200%201%201.416-2.648%204.027%204.027%200%200%201%205.542.322%204.09%204.09%200%200%201%201.104%202.795c0%201.04-.395%202.04-1.104%202.795a4.027%204.027%200%200%201-5.543.322%204.08%204.08%200%200%201-1.415-2.648H39.87c.237%204.26%203.662%207.639%207.853%207.639a7.2%207.2%200%200%200%204.162-1.417l.571%201.23h3.343V.917z'/%3e%3c/svg%3e"
            />
          </a>

          {/* Search */}
          <div className="text-field-wrapper space-y-1 header_search w-auto flex-1 lg:ml-auto lg:max-w-[230px]">
            <div className="flex items-center border border-border-primary rounded-full bg-theme-bg h-[34px] gap-2 px-4 py-2">
              <Search className="size-4 min-w-4" />
              <input
                className="size-full border-none bg-transparent outline-none"
                placeholder="Tìm kiếm"
                readOnly
              />
            </div>
          </div>

          {/* Cart */}
          <a aria-label="cart" className="h-6" href="/cart">
            <div className="relative inline-block">
              <ShoppingCart className="w-6 min-w-6" />
            </div>
          </a>
        </div>

        {/* Danh mục Button */}
        <button
          className="fixed top-4 left-12 z-[9999] min-w-[128px] justify-center inline-flex items-center gap-2 rounded-rounded border border-border-primary bg-theme-bg text-theme-text hover:bg-theme-surface-hover h-[34px] px-4 py-2 text-label-md"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="size-4 min-w-4" />
          Danh mục
        </button>
{/* quá xấu nên comment luông hihi */}
        {/* {isMenuOpen && (
          <div
            className="flex h-[calc(100vh-66px)] w-full flex-col bg-white px-12 py-4 shadow-lg"
            style={{ transform: "none" }}
          >
            <div className="flex h-fit w-full items-center justify-between gap-3 border-b border-border-primary pb-4">
              <a aria-label="go home" href="/">
                <img
                  alt="logo"
                  className="h-8 min-h-8 min-w-[84px]"
                  height="32"
                  src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='33'%20fill='none'%3e%3cpath%20fill='%232A2A86'%20d='M30.18%2020.503a3.98%203.98%200%200%201-3.636-2.34%203.97%203.97%200%200%201%20.652-4.27%203.98%203.98%200%200%201%204.17-1.15%203.98%203.98%200%200%201%202.758%203.328h3.996a7.95%207.95%200%200%200-2.571-5.405%207.98%207.98%200%200%200-11.104.32%207.95%207.95%200%200%200%200%2011.09%207.977%207.977%200%200%200%2011.104.32%207.95%207.95%200%200%200%202.57-5.405h-3.98a3.97%203.97%200%200%201-1.31%202.509%203.98%203.98%200%200%201-2.649%201.003M16.606%209.047v7.742c0%202.026-1.764%203.667-3.75%203.667s-3.765-1.648-3.765-3.667V9.047H5.334v7.742c0%201.008.195%202.006.573%202.937.378.93.932%201.777%201.63%202.489a7.5%207.5%200%200%200%202.441%201.663%207.4%207.4%200%200%200%202.879.583c1.433%200%202.536-.372%203.749-1.505v1.528c0%202.026-1.564%203.667-3.75%203.667-2.184%200-3.92-1.645-3.92-3.667H5.334A7.75%207.75%200%200%200%207.58%2029.83a7.45%207.45%200%200%200%205.276%202.204%207.45%207.45%200%200%200%205.275-2.204%207.75%207.75%200%200%200%202.246-5.345V9.061z'/%3e%3cpath%20fill='%23FCAF17'%20d='M68.896%209.047v8.04c0%202.103-1.868%203.807-3.97%203.807s-3.987-1.708-3.987-3.807v-8.04h-3.978v8.04a7.97%207.97%200%200%200%204.917%207.361c.967.4%202.002.607%203.048.606%201.518%200%202.685-.386%203.97-1.563v1.587c0%202.103-1.656%203.807-3.97%203.807s-4.151-1.708-4.151-3.807h-3.814a7.963%207.963%200%200%200%2015.928%200V9.062zM51.854.916v9.033a7%207%200%200%200-4.132-1.38c-4.202%200-7.618%203.383-7.853%207.64h4.025a4.08%204.08%200%200%201%201.416-2.648%204.027%204.027%200%200%201%205.542.322%204.09%204.09%200%200%201%201.104%202.795c0%201.04-.395%202.04-1.104%202.795a4.027%204.027%200%200%201-5.543.322%204.08%204.08%200%200%201-1.415-2.648H39.87c.237%204.26%203.662%207.639%207.853%207.639a7.2%207.2%200%200%200%204.162-1.417l.571%201.23h3.343V.917z'/%3e%3c/svg%3e"
                />
              </a>
              <div className="relative mt-auto flex w-full flex-col items-center gap-6">
                <div className="text-field-wrapper space-y-1 mt-auto w-[640px]">
                  <div
                    className="flex items-center border border-border-primary rounded-full bg-theme-bg focus-within:!border-border-brand gap-2 px-4 py-3"
                    data-error="false"
                  >
                    <span className="size-5 min-w-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                        />
                      </svg>
                    </span>
                    <input
                      className="size-full border-none bg-transparent outline-none"
                      data-error="false"
                      id="searchInput"
                      placeholder="Tìm kiếm"
                      value=""
                    />
                    <span className="size-5 min-w-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="size-5 cursor-pointer hidden"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <a
                aria-label="cart"
                className="ml-auto flex h-6 min-w-[84px] items-center justify-end gap-2"
                href="/cart"
              >
                <div className="relative inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-6 min-w-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="" />
                  </svg>
                </div>
              </a>
            </div>

            <div className="mt-4 space-y-6">
              <div className="flex w-full justify-center gap-3">
                <a
                  aria-label="CỬA HÀNG"
                  href="/he-thong-cua-hang"
                  className="flex items-center gap-2 rounded-md bg-theme-surface px-3 py-2"
                >
                  <svg
                    width="25"
                    height="24"
                    viewBox="0 0 25 24"
                    fill="none"
                    className="w-6 min-w-6"
                  >
                    <g clipPath="url(#clip0_3997_71968)">
                      <path d=" " fill="#111928"></path>
                      <path d=" " fill="#111928"></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_3997_71968">
                        <rect
                          width="24"
                          height="24"
                          fill="white"
                          transform="translate(0.5)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <div className="flex w-full justify-center gap-3">
                  <a
                    aria-label="CỬA HÀNG"
                    href="/he-thong-cua-hang"
                    className="flex items-center gap-2 rounded-md bg-theme-surface px-3 py-2"
                  >
                    <svg
                      width="25"
                      height="24"
                      viewBox="0 0 25 24"
                      fill="none"
                      className="w-6 min-w-6"
                    >
                      <g clipPath="url(#clip0_3997_71968)">
                        <path d=" " fill="#111928" />
                        <path d=" " fill="#111928" />
                      </g>
                      <defs>
                        <clipPath id="clip0_3997_71968">
                          <rect
                            width="24"
                            height="24"
                            fill="white"
                            transform="translate(0.5)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                    <p className="text-theme-text text-label-lg uppercase">
                      CỬA HÀNG
                    </p>
                  </a>

                  <a
                    aria-label="TIN TỨC"
                    href="/tin-tuc"
                    className="flex items-center gap-2 rounded-md bg-theme-surface px-3 py-2"
                  >
                    <p className="text-theme-text text-label-lg uppercase">
                      TIN TỨC
                    </p>
                  </a>

                  <a
                    aria-label="MỚI VỀ"
                    href="/moi-ve"
                    className="flex items-center gap-2 rounded-md bg-theme-surface px-3 py-2"
                  >
                    <p className="text-theme-text text-label-lg uppercase">
                      MỚI VỀ
                    </p>
                  </a>

                  <a
                    aria-label="ƯU ĐÃI"
                    href="/uu-dai"
                    className="flex items-center gap-2 rounded-md bg-theme-surface px-3 py-2"
                  >
                    <p className="text-theme-text text-label-lg uppercase">
                      ƯU ĐÃI
                    </p>
                  </a>

                  <a
                    aria-label="BỘ SƯU TẬP"
                    href="/bo-suu-tap"
                    className="flex items-center gap-2 rounded-md bg-theme-surface px-3 py-2"
                  >
                    <p className="text-theme-text text-label-lg uppercase">
                      BỘ SƯU TẬP
                    </p>
                  </a>
                </div>
              </div>
              <div className="mt-6 border-t border-border-primary pt-4">
                <ul className="flex gap-6">
                  {categories.map((cat, idx) => (
                    <li key={idx} className="relative">
                      <button
                        onClick={() =>
                          setActiveCategory(activeCategory === idx ? null : idx)
                        }
                        className="flex items-center gap-1 font-semibold hover:text-blue-600"
                      >
                        {cat.name}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            activeCategory === idx ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {activeCategory === idx && (
                        <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg border rounded z-50">
                          <ul className="divide-y max-h-64 overflow-y-auto">
                            {cat.subcategories.map((sub, subIdx) => (
                              <li
                                key={subIdx}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100"
                              >
                                <img
                                  src={sub.img}
                                  alt={sub.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <a
                                  href={`/collection/${sub.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                                  className="text-gray-700 hover:text-blue-600"
                                >
                                  {sub.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )} */}
      </header>

      <main className="mx-auto max-w-screen-sm lg:max-w-full">
        {/* Hero Banner */}
        <section className="relative mb-12 mt-[-60px] lg:mt-[-68px]">
          <div className="relative overflow-hidden">
            <div
              className="flex aspect-[9/16] w-full lg:aspect-video transition-transform duration-500 ease-in-out"
              style={{
                transform: `translate3d(-${currentSlide * 100}%, 0px, 0px)`,
              }}
            >
              {bannerSlides.map((slide, index) => (
                <a
                  key={slide.id}
                  href={slide.link}
                  className="min-w-full"
                  aria-label="go to banner"
                >
                  <img
                    alt={slide.alt}
                    className="size-full object-cover"
                    src={slide.desktop}
                  />
                </a>
              ))}
            </div>

            {/* Navigation buttons */}
            <button
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-white border border-gray-300 p-2 rounded shadow-md hover:bg-gray-50 hidden lg:flex"
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? bannerSlides.length - 1 : prev - 1
                )
              }
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-white border border-gray-300 p-2 rounded shadow-md hover:bg-gray-50 hidden lg:flex"
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
              }
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 flex gap-1 left-1/2 -translate-x-1/2">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentSlide === index ? "bg-white" : "bg-white/30"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* BST POLO COOL 2025 */}
        <section className="mb-12 lg:mb-16 lg:px-12">
          <div className="mb-3 flex items-center justify-center lg:mb-8 lg:justify-between">
            <h2 className="text-2xl font-bold lg:text-4xl">
              BST POLO COOL 2025
            </h2>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex w-full gap-2">
              {poloCollection.map((item, index) => (
                <a
                  key={item.id}
                  href={item.link}
                  className="ml-2 aspect-[3/4] min-w-[calc(100%-64px)] max-w-[calc(100%-64px)] lg:aspect-video lg:min-w-[calc(25%-8px)] lg:max-w-[calc(25%-8px)]"
                >
                  {item.type === "video" ? (
                    <video
                      src={item.src}
                      className="size-full rounded-md object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      alt="collection"
                      className="size-full rounded-md object-cover"
                      src={item.src}
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Business Casual Video Banner */}
        <section className="relative mb-12 lg:mb-16">
          <div className="relative overflow-hidden">
            <div className="flex aspect-[9/16] w-full lg:aspect-video">
              <a
                href="/collection/bst-business-casual-2025"
                className="min-w-full"
              >
                <video
                  src="https://buggy.yodycdn.com/videos/raw/5c2ac386cd5d761ae348b561ac7c5be4.mp4"
                  className="size-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </a>
            </div>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="px-2 lg:px-12 mb-12 lg:mb-16">
          <h1 className="mb-3 text-center text-2xl font-bold lg:mb-8 lg:text-left lg:text-4xl">
            CÁC BST NỔI BẬT TẠI YODY
          </h1>
          <div className="grid grid-cols-2 gap-x-2 gap-y-3 lg:grid-cols-4 lg:gap-x-4">
            {featuredCollections.map((collection) => (
              <a
                key={collection.id}
                href={collection.link}
                aria-label="go to collection"
              >
                <img
                  alt={collection.name}
                  className="aspect-[3/4] w-full rounded-md object-cover hover:scale-105 transition-transform duration-200"
                  src={collection.image}
                />
              </a>
            ))}
          </div>
        </section>

        {/* Blog/News Section */}
        <section className="relative mb-12 lg:mb-16">
          <div className="relative overflow-hidden">
            <div className="flex aspect-[9/16] w-full lg:aspect-video">
              {blogPosts.map((post, index) => (
                <a
                  key={post.id}
                  href={post.link}
                  className={`min-w-full ${index === 0 ? "" : "hidden"}`}
                >
                  <img
                    alt="blog post"
                    className="size-full object-cover"
                    src={post.desktop}
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto space-y-8 px-3 py-11 pb-[88px] lg:mx-auto lg:max-w-screen-2xl lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row-reverse lg:justify-around">
            {/* Contact Info */}
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex flex-col gap-4 lg:min-w-[515px] lg:flex-row">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 lg:w-[161px]">
                    <Phone className="size-6 min-w-6" />
                    <div className="space-y-[2px]">
                      <p className="text-sm text-gray-300">Đặt hàng</p>
                      <a
                        href="tel:02499986999"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <p className="font-semibold">024 999 86 999</p>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:w-[161px]">
                    <Phone className="size-6 min-w-6" />
                    <div className="space-y-[2px]">
                      <p className="text-sm text-gray-300">Góp ý khiếu nại</p>
                      <a href="tel:18002086" target="_blank" rel="noreferrer">
                        <p className="font-semibold">1800 2086</p>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="size-6 min-w-6" />
                    <div className="space-y-[2px]">
                      <p className="text-sm text-gray-300">Email</p>
                      <a
                        href="mailto:chamsockhachhang@yody.vn"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <p className="font-semibold break-words">
                          chamsockhachhang@yody.vn
                        </p>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="size-6 min-w-6" />
                    <div className="space-y-[2px]">
                      <p className="text-sm text-gray-300">Địa chỉ</p>
                      <a
                        href="https://maps.app.goo.gl/JM9QivNaWDvqLxhZ6"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <p className="font-semibold break-words">
                          Đường An Định - Phường Việt Hoà - TP Hải Dương
                        </p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex justify-around lg:h-fit lg:gap-5">
                <a
                  href="https://zalo.me/330373955557900892"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700"
                >
                  <span className="text-sm font-semibold">Zalo</span>
                </a>
                <a
                  href="https://m.me/yody.brand/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700"
                >
                  <span className="text-sm font-semibold">Messenger</span>
                </a>
                <a
                  href="https://www.tiktok.com/@yodyofficial.studio"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700"
                >
                  <span className="text-sm font-semibold">TikTok</span>
                </a>
                <a
                  href="https://www.youtube.com/@YODYLifestyle"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700"
                >
                  <span className="text-sm font-semibold">YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/yody.official/"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700"
                >
                  <span className="text-sm font-semibold">Instagram</span>
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col lg:col-span-2">
              <div>
                <p className="font-semibold mb-2">YODY XIN CHÀO 💖</p>
                <p className="text-sm pb-4 pt-2 text-gray-300">
                  Chúng tôi luôn quý trọng và tiếp thu mọi ý kiến đóng góp từ
                  khách hàng, nhằm không ngừng cải thiện và nâng tầm trải nghiệm
                  dịch vụ cũng như chất lượng sản phẩm.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center border border-gray-600 rounded-full bg-gray-800 h-[34px] gap-2 px-4 py-2 focus-within:border-blue-500">
                      <Mail className="size-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Nhập địa chỉ email của bạn"
                        className="flex-1 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium text-sm min-w-20 lg:min-w-[143px]">
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="border-t border-gray-700 pt-8">
            <div className="lg:flex lg:justify-between lg:items-center">
              <div>
                <p className="font-semibold mb-2">
                  @ CÔNG TY CỔ PHẦN THỜI TRANG YODY
                </p>
                <p className="text-sm text-gray-300 mb-4 lg:mb-0">
                  Mã số doanh nghiệp: 0801206940. Giấy chứng nhận đăng ký doanh
                  nghiệp do Sở Kế hoạch và Đầu tư TP Hải Dương cấp lần đầu ngày
                  04/03/2017
                </p>
              </div>
              <div className="flex gap-5">
                <a
                  href="https://www.dmca.com/Protection/Status.aspx?ID=d3a2c2c5-a581-451b-b7ff-ff08fee58d6a"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    alt="DMCA"
                    className="h-10 w-[80px]"
                    src="https://buggy.yodycdn.com/images//assets/footer_dmca.webp"
                  />
                </a>
                <a
                  href="http://online.gov.vn/Home/WebDetails/44085"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    alt="Bộ Công Thương"
                    className="h-10 w-[105.5px]"
                    src="https://buggy.yodycdn.com/images//assets/footer_bct.webp"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 p-3 rounded shadow-md hover:bg-gray-50 transition-transform duration-300">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
};

export default YodyHomepage;
