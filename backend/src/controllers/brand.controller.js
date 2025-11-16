// controllers/brand.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { Brand, Product, sequelize } = models;

// Utils
import {
  uploadImage,
  deleteImage,
  downloadImageFromUrl,
} from "../utils/imageUpload.js";

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU BRAND MODEL
 */
const BRAND_FIELDS = {
  ID: "id",
  NAME: "name",
  SLUG: "slug",
  DESCRIPTION: "description",
  LOGO_URL: "logo_url",
  WEBSITE_URL: "website_url",
  IS_ACTIVE: "is_active",
  SORT_ORDER: "sort_order",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

class BrandController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH BRANDS (PHÂN TRANG & FILTER)
  // =========================================================
  async getBrands(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        is_active,
        sortBy = BRAND_FIELDS.SORT_ORDER,
        sortOrder = "ASC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { [BRAND_FIELDS.NAME]: { [Op.like]: `%${search}%` } },
          { [BRAND_FIELDS.SLUG]: { [Op.like]: `%${search}%` } },
          { [BRAND_FIELDS.DESCRIPTION]: { [Op.like]: `%${search}%` } },
        ];
      }

      if (is_active !== undefined) {
        where[BRAND_FIELDS.IS_ACTIVE] = is_active === "true";
      }

      console.log(`📋 Admin đang lấy danh sách brands...`);

      const { count, rows: brands } = await Brand.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        message: `Lấy danh sách brands thành công. Tổng: ${count} brands`,
        data: {
          brands,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách brands:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách thương hiệu.",
      });
    }
  }

  // =========================================================
  // 👥 PUBLIC: LẤY DANH SÁCH BRANDS ACTIVE (CHO WEBSITE)
  // =========================================================
  async getActiveBrands(req, res) {
    try {
      console.log("🌐 Đang lấy danh sách brands active...");

      const brands = await Brand.findAll({
        where: {
          [BRAND_FIELDS.IS_ACTIVE]: true,
        },
        order: [
          [BRAND_FIELDS.SORT_ORDER, "ASC"],
          [BRAND_FIELDS.NAME, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: "Lấy danh sách thương hiệu thành công",
        data: brands,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách brands active:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách thương hiệu.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT BRAND THEO ID HOẶC SLUG
  // =========================================================
  async getBrandById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết brand: ${id}`);

      const where = {};
      if (isNaN(id)) {
        where[BRAND_FIELDS.SLUG] = id; // Nếu không phải số, tìm theo slug
      } else {
        where[BRAND_FIELDS.ID] = parseInt(id);
      }

      const brand = await Brand.findOne({ where });

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin thương hiệu thành công",
        data: brand,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết brand:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin thương hiệu.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO BRAND MỚI
  // =========================================================
  async createBrand(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        name,
        slug,
        description,
        website_url,
        sort_order = 0,
        is_active = true,
        logo_url, // URL logo từ bên ngoài
      } = req.body;

      console.log("➕ Đang tạo brand mới...");

      // 🎯 Validation
      if (!name || !slug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Tên thương hiệu và slug là bắt buộc.",
        });
      }

      // Kiểm tra slug trùng
      const existingSlug = await Brand.findOne({
        where: { [BRAND_FIELDS.SLUG]: slug },
        transaction,
      });

      if (existingSlug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        });
      }

      let logoPath = null;

      // 🖼️ Xử lý logo từ nhiều nguồn
      if (req.file) {
        // 1. Logo upload từ máy local
        console.log("📸 Đang xử lý logo upload...");
        logoPath = await uploadImage(req.file, "brands");
      } else if (logo_url) {
        // 2. Logo từ URL
        console.log("🌐 Đang tải logo từ URL...");
        logoPath = await downloadImageFromUrl(logo_url, "brands");
      }

      // 🗄️ Tạo brand
      const brandData = {
        [BRAND_FIELDS.NAME]: name,
        [BRAND_FIELDS.SLUG]: slug.toLowerCase(),
        [BRAND_FIELDS.DESCRIPTION]: description,
        [BRAND_FIELDS.LOGO_URL]: logoPath,
        [BRAND_FIELDS.WEBSITE_URL]: website_url,
        [BRAND_FIELDS.SORT_ORDER]: parseInt(sort_order),
        [BRAND_FIELDS.IS_ACTIVE]: Boolean(is_active),
      };

      const brand = await Brand.create(brandData, { transaction });

      await transaction.commit();

      console.log(
        `✅ Đã tạo brand thành công: ${name} (ID: ${brand[BRAND_FIELDS.ID]})`
      );

      return res.status(201).json({
        success: true,
        message: "Tạo thương hiệu thành công!",
        data: brand,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi tạo brand:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo thương hiệu.",
      });
    }
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT BRAND
  // =========================================================
  async updateBrand(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        name,
        slug,
        description,
        website_url,
        sort_order,
        is_active,
        logo_url,
        remove_logo = false,
      } = req.body;

      console.log(`✏️ Đang cập nhật brand ID: ${id}...`);

      // Tìm brand
      const brand = await Brand.findByPk(id, { transaction });
      if (!brand) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu.",
        });
      }

      // Kiểm tra slug trùng (trừ chính nó)
      if (slug && slug !== brand[BRAND_FIELDS.SLUG]) {
        const existingSlug = await Brand.findOne({
          where: {
            [BRAND_FIELDS.SLUG]: slug,
            [BRAND_FIELDS.ID]: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingSlug) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Slug đã tồn tại. Vui lòng chọn slug khác.",
          });
        }
      }

      let logoPath = brand[BRAND_FIELDS.LOGO_URL];

      // 🗑️ Xóa logo cũ nếu có yêu cầu
      if (remove_logo && brand[BRAND_FIELDS.LOGO_URL]) {
        console.log("🗑️ Đang xóa logo cũ...");
        await deleteImage(brand[BRAND_FIELDS.LOGO_URL]);
        logoPath = null;
      }

      // 🖼️ Xử lý logo mới
      if (req.file) {
        // Xóa logo cũ nếu có
        if (brand[BRAND_FIELDS.LOGO_URL]) {
          await deleteImage(brand[BRAND_FIELDS.LOGO_URL]);
        }
        // Upload logo mới
        logoPath = await uploadImage(req.file, "brands");
      } else if (logo_url && logo_url !== brand[BRAND_FIELDS.LOGO_URL]) {
        // Xóa logo cũ nếu có
        if (
          brand[BRAND_FIELDS.LOGO_URL] &&
          !brand[BRAND_FIELDS.LOGO_URL].startsWith("http")
        ) {
          await deleteImage(brand[BRAND_FIELDS.LOGO_URL]);
        }
        // Tải logo từ URL
        logoPath = await downloadImageFromUrl(logo_url, "brands");
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(name && { [BRAND_FIELDS.NAME]: name }),
        ...(slug && { [BRAND_FIELDS.SLUG]: slug.toLowerCase() }),
        ...(description !== undefined && {
          [BRAND_FIELDS.DESCRIPTION]: description,
        }),
        ...(website_url !== undefined && {
          [BRAND_FIELDS.WEBSITE_URL]: website_url,
        }),
        ...(logoPath !== undefined && { [BRAND_FIELDS.LOGO_URL]: logoPath }),
        ...(sort_order !== undefined && {
          [BRAND_FIELDS.SORT_ORDER]: parseInt(sort_order),
        }),
        ...(is_active !== undefined && {
          [BRAND_FIELDS.IS_ACTIVE]: Boolean(is_active),
        }),
      };

      await brand.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất
      const updatedBrand = await Brand.findByPk(id);

      console.log(`✅ Đã cập nhật brand thành công: ${name} (ID: ${id})`);

      return res.json({
        success: true,
        message: "Cập nhật thương hiệu thành công!",
        data: updatedBrand,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật brand:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật thương hiệu.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA BRAND (SOFT DELETE)
  // =========================================================
  async deleteBrand(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa brand ID: ${id}...`);

      const brand = await Brand.findByPk(id, { transaction });
      if (!brand) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu.",
        });
      }

      // Kiểm tra xem brand có sản phẩm không
      const productCount = await Product.count({
        where: { brand_id: id },
        transaction,
      });

      if (productCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể xóa thương hiệu vì có ${productCount} sản phẩm đang sử dụng. Hãy chuyển sản phẩm sang thương hiệu khác trước.`,
        });
      }

      // Xóa logo nếu có
      if (brand[BRAND_FIELDS.LOGO_URL]) {
        await deleteImage(brand[BRAND_FIELDS.LOGO_URL]);
      }

      // Xóa brand
      await brand.destroy({ transaction });
      await transaction.commit();

      console.log(
        `✅ Đã xóa brand thành công: ${brand[BRAND_FIELDS.NAME]} (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Xóa thương hiệu thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa brand:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa thương hiệu.",
      });
    }
  }

  // =========================================================
  // 🔄 ADMIN: THAY ĐỔI TRẠNG THÁI BRAND
  // =========================================================
  async toggleBrandStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🔄 Đang thay đổi trạng thái brand ID: ${id}...`);

      const brand = await Brand.findByPk(id, { transaction });
      if (!brand) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu.",
        });
      }

      // Đảo ngược trạng thái
      const newStatus = !brand[BRAND_FIELDS.IS_ACTIVE];
      await brand.update(
        { [BRAND_FIELDS.IS_ACTIVE]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} brand: ${
          brand[BRAND_FIELDS.NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Kích hoạt" : "Vô hiệu hóa"
        } thương hiệu thành công!`,
        data: {
          id: brand[BRAND_FIELDS.ID],
          name: brand[BRAND_FIELDS.NAME],
          is_active: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái brand:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái thương hiệu.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ BRANDS
  // =========================================================
  async getBrandStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê brands...");

      const totalBrands = await Brand.count();
      const activeBrands = await Brand.count({
        where: { [BRAND_FIELDS.IS_ACTIVE]: true },
      });
      const inactiveBrands = totalBrands - activeBrands;

      const brandsWithProducts = await Brand.findAll({
        attributes: [
          BRAND_FIELDS.ID,
          BRAND_FIELDS.NAME,
          [
            sequelize.fn("COUNT", sequelize.col("products.id")),
            "product_count",
          ],
        ],
        include: [
          {
            model: Product,
            attributes: [],
            required: false,
          },
        ],
        group: ["Brand.id"],
        raw: true,
      });

      return res.json({
        success: true,
        message: "Lấy thống kê brands thành công",
        data: {
          total_brands: totalBrands,
          active_brands: activeBrands,
          inactive_brands: inactiveBrands,
          brands_with_products: brandsWithProducts,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê brands:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê thương hiệu.",
      });
    }
  }
}

export default new BrandController();

// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { BRAND_FIELDS };
