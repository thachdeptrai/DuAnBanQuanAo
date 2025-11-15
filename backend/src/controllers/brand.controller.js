import BrandModel from "../model/brand.model.js";
import sequelize from "../config/db.js";
import path from "path";
import fs from "fs";

const Brand = BrandModel(sequelize);

// ================== GET ALL ==================
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      order: [["id", "ASC"]],
    });
    res.json(brands);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách brand", error: err.message });
  }
};

// ================== GET BY ID ==================
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand không tồn tại" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy brand", error: err.message });
  }
};

// ================== CREATE ==================
export const createBrand = async (req, res) => {
  try {
    const { name, slug, description, website_url, logo_url } = req.body;

    // Validate cơ bản
    if (!name || !slug) {
      return res.status(400).json({ message: "Tên và slug là bắt buộc" });
    }

    // Kiểm tra slug tồn tại chưa
    const existing = await Brand.findOne({ where: { slug } });
    if (existing) return res.status(400).json({ message: "Slug đã tồn tại" });

    // Lấy logo từ upload hoặc từ URL
    let finalLogoUrl = logo_url || null;
    if (req.file) {
      finalLogoUrl = `/uploads/${req.file.filename}`;
    }

    const newBrand = await Brand.create({
      name,
      slug,
      description: description || null,
      website_url: website_url || null,
      logo_url: finalLogoUrl,
    });

    res.status(201).json({ message: "Tạo brand thành công", brand: newBrand });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo brand", error: err.message });
  }
};

// ================== UPDATE ==================
export const updateBrand = async (req, res) => {
  try {
    const { name, slug, description, website_url, logo_url, is_active } =
      req.body;
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand không tồn tại" });

    // Nếu update slug, kiểm tra trùng
    if (slug && slug !== brand.slug) {
      const existing = await Brand.findOne({ where: { slug } });
      if (existing) return res.status(400).json({ message: "Slug đã tồn tại" });
    }

    // Xử lý upload ảnh mới
    if (req.file) {
      if (brand.logo_url && brand.logo_url.startsWith("/uploads/")) {
        const oldPath = path.join("uploads", path.basename(brand.logo_url));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      brand.logo_url = `/uploads/${req.file.filename}`;
    } else if (logo_url) {
      brand.logo_url = logo_url;
    }

    // Cập nhật thông tin
    brand.name = name || brand.name;
    brand.slug = slug || brand.slug;
    brand.description = description ?? brand.description;
    brand.website_url = website_url ?? brand.website_url;
    if (is_active !== undefined) brand.is_active = is_active;

    await brand.save();

    res.json({ message: "Cập nhật brand thành công", brand });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật brand", error: err.message });
  }
};

// ================== DELETE ==================
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand không tồn tại" });

    // Xóa file logo nếu là file upload
    if (brand.logo_url && brand.logo_url.startsWith("/uploads/")) {
      const filePath = path.join("uploads", path.basename(brand.logo_url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await brand.destroy();
    res.json({ message: "Xóa brand thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa brand", error: err.message });
  }
};
