import Banner from "../models/Banner.js";

// Lấy tất cả banner đang active
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ position: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin tạo banner
export const createBanner = async (req, res) => {
  try {
    const { title, imageUrl, link, position } = req.body;
    const banner = new Banner({ title, imageUrl, link, position });
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin cập nhật banner
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    Object.assign(banner, req.body);
    await banner.save();

    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin xóa banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    await banner.remove();
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
