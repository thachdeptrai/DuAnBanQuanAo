// controllers/category.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { Category, Product, sequelize } = models; // ✅ IMPORT CHUẨN

// Utils
import {
  uploadImage,
  deleteImage,
  downloadImageFromUrl,
} from "../utils/imageUpload.js";

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU CATEGORY MODEL
 * Đảm bảo thống nhất với database schema
 */
const CATEGORY_FIELDS = {
  ID: "id",
  NAME: "name",
  SLUG: "slug",
  PARENT_ID: "parent_id",
  DESCRIPTION: "description",
  IMAGE: "image",
  SORT_ORDER: "sort_order",
  IS_ACTIVE: "is_active",
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

class CategoryController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH CATEGORIES (PHÂN TRANG & FILTER)
  // =========================================================
  async getCategories(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        is_active,
        parent_id,
        sortBy = CATEGORY_FIELDS.SORT_ORDER,
        sortOrder = "ASC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { [CATEGORY_FIELDS.NAME]: { [Op.like]: `%${search}%` } },
          { [CATEGORY_FIELDS.SLUG]: { [Op.like]: `%${search}%` } },
          { [CATEGORY_FIELDS.DESCRIPTION]: { [Op.like]: `%${search}%` } },
        ];
      }

      if (is_active !== undefined) {
        where[CATEGORY_FIELDS.IS_ACTIVE] = is_active === "true";
      }

      if (parent_id !== undefined) {
        where[CATEGORY_FIELDS.PARENT_ID] =
          parent_id === "null" ? null : parent_id;
      }

      console.log(`📋 Admin đang lấy danh sách categories...`);

      const { count, rows: categories } = await Category.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: "parent",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
            ],
          },
          {
            model: Category,
            as: "children",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
              CATEGORY_FIELDS.IS_ACTIVE,
            ],
            where: { [CATEGORY_FIELDS.IS_ACTIVE]: true },
            required: false,
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        message: `Lấy danh sách categories thành công. Tổng: ${count} categories`,
        data: {
          categories,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách categories:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách danh mục.",
      });
    }
  }

  // =========================================================
  // 👥 PUBLIC: LẤY DANH SÁCH CATEGORIES ACTIVE (CHO WEBSITE)
  // =========================================================
  async getActiveCategories(req, res) {
    try {
      console.log("🌐 Đang lấy danh sách categories active...");

      const categories = await Category.findAll({
        where: {
          [CATEGORY_FIELDS.IS_ACTIVE]: true,
        },
        include: [
          {
            model: Category,
            as: "parent",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
            ],
            where: { [CATEGORY_FIELDS.IS_ACTIVE]: true },
            required: false,
          },
          {
            model: Category,
            as: "children",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
              CATEGORY_FIELDS.IMAGE,
              CATEGORY_FIELDS.DESCRIPTION,
            ],
            where: { [CATEGORY_FIELDS.IS_ACTIVE]: true },
            required: false,
          },
        ],
        order: [
          [CATEGORY_FIELDS.SORT_ORDER, "ASC"],
          [CATEGORY_FIELDS.NAME, "ASC"],
        ],
      });

      // Nhóm categories theo parent
      const parentCategories = categories.filter(
        (cat) => cat[CATEGORY_FIELDS.PARENT_ID] === null
      );

      const categoriesWithChildren = parentCategories.map((parent) => {
        const children = categories.filter(
          (child) =>
            child[CATEGORY_FIELDS.PARENT_ID] === parent[CATEGORY_FIELDS.ID]
        );
        return {
          ...parent.toJSON(),
          children,
        };
      });

      return res.json({
        success: true,
        message: "Lấy danh sách danh mục thành công",
        data: categoriesWithChildren,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách categories active:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách danh mục.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT CATEGORY THEO ID HOẶC SLUG
  // =========================================================
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết category: ${id}`);

      const where = {};
      if (isNaN(id)) {
        where[CATEGORY_FIELDS.SLUG] = id; // Nếu không phải số, tìm theo slug
      } else {
        where[CATEGORY_FIELDS.ID] = parseInt(id);
      }

      const category = await Category.findOne({
        where,
        include: [
          {
            model: Category,
            as: "parent",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
            ],
          },
          {
            model: Category,
            as: "children",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
              CATEGORY_FIELDS.IMAGE,
              CATEGORY_FIELDS.DESCRIPTION,
              CATEGORY_FIELDS.IS_ACTIVE,
            ],
            where: { [CATEGORY_FIELDS.IS_ACTIVE]: true },
            required: false,
          },
        ],
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin danh mục thành công",
        data: category,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết category:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin danh mục.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO CATEGORY MỚI
  // =========================================================
  async createCategory(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        name,
        slug,
        parent_id,
        description,
        sort_order = 0,
        is_active = true,
        meta_title,
        meta_description,
        image_url, // URL ảnh từ bên ngoài
      } = req.body;

      console.log("➕ Đang tạo category mới...");

      // 🎯 Validation cơ bản
      if (!name || !slug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Tên danh mục và slug là bắt buộc.",
        });
      }

      // Kiểm tra slug trùng
      const existingSlug = await Category.findOne({
        where: { [CATEGORY_FIELDS.SLUG]: slug.toLowerCase() },
        transaction,
      });

      if (existingSlug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        });
      }

      let imagePath = null;

      // 🖼️ Xử lý ảnh và bắt lỗi file/URL riêng biệt
      try {
        if (req.file) {
          // 1. Ảnh upload từ máy local
          console.log("📸 Đang xử lý ảnh upload...");
          // Giả sử uploadImage sẽ throw error nếu thất bại
          imagePath = await uploadImage(req.file, "categories");
        } else if (image_url) {
          // 2. Ảnh từ URL
          console.log("🌐 Đang tải ảnh từ URL...");
          // Giả sử downloadImageFromUrl sẽ throw error nếu thất bại
          imagePath = await downloadImageFromUrl(image_url, "categories");
        }
      } catch (fileError) {
        // Bắt lỗi cụ thể liên quan đến việc xử lý file/URL
        await transaction.rollback();
        console.error("❌ Lỗi xử lý file category:", fileError);
        return res.status(500).json({
          success: false,
          message: `Lỗi xử lý hình ảnh danh mục: Vui lòng kiểm tra file hoặc URL ảnh.`,
          // Có thể thêm chi tiết lỗi nếu cần: error: fileError.message
        });
      }

      // 🗄️ Tạo category
      const categoryData = {
        [CATEGORY_FIELDS.NAME]: name,
        [CATEGORY_FIELDS.SLUG]: slug.toLowerCase(),
        // Thêm logic kiểm tra parent_id hợp lệ nếu cần, nếu không thì dùng || null là ổn
        [CATEGORY_FIELDS.PARENT_ID]: parent_id || null,
        [CATEGORY_FIELDS.DESCRIPTION]: description || null, // Chắc chắn là null nếu không có
        [CATEGORY_FIELDS.IMAGE]: imagePath,
        [CATEGORY_FIELDS.SORT_ORDER]: parseInt(sort_order) || 0,
        [CATEGORY_FIELDS.IS_ACTIVE]: Boolean(is_active),
        // Xử lý SEO Metadata thông minh
        [CATEGORY_FIELDS.META_TITLE]: meta_title || name,
        [CATEGORY_FIELDS.META_DESCRIPTION]:
          meta_description ||
          (description ? description.substring(0, 255) : null),
      };

      const category = await Category.create(categoryData, { transaction });

      // Commit nếu mọi thứ thành công
      await transaction.commit();

      console.log(
        `✅ Đã tạo category thành công: ${name} (ID: ${
          category[CATEGORY_FIELDS.ID]
        })`
      );

      return res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công!",
        data: category,
      });
    } catch (error) {
      // Rollback transaction nếu có lỗi DB hoặc lỗi khác ngoài lỗi file đã bắt
      await transaction.rollback();
      console.error("❌ Lỗi hệ thống khi tạo category:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo danh mục. Vui lòng thử lại sau.",
      });
    }
  }
  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT CATEGORY
  // =========================================================
  async updateCategory(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        name,
        slug,
        parent_id,
        description,
        sort_order,
        is_active,
        meta_title,
        meta_description,
        image_url,
        remove_image = false,
      } = req.body;

      console.log(`✏️ Đang cập nhật category ID: ${id}...`);

      // Tìm category
      const category = await Category.findByPk(id, { transaction });
      if (!category) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục.",
        });
      }

      // Kiểm tra slug trùng (trừ chính nó)
      if (slug && slug !== category[CATEGORY_FIELDS.SLUG]) {
        const existingSlug = await Category.findOne({
          where: {
            [CATEGORY_FIELDS.SLUG]: slug,
            [CATEGORY_FIELDS.ID]: { [Op.ne]: id },
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

      let imagePath = category[CATEGORY_FIELDS.IMAGE];

      // 🗑️ Xóa ảnh cũ nếu có yêu cầu
      if (remove_image && category[CATEGORY_FIELDS.IMAGE]) {
        console.log("🗑️ Đang xóa ảnh cũ...");
        await deleteImage(category[CATEGORY_FIELDS.IMAGE]);
        imagePath = null;
      }

      // 🖼️ Xử lý ảnh mới
      if (req.file) {
        // Xóa ảnh cũ nếu có
        if (category[CATEGORY_FIELDS.IMAGE]) {
          await deleteImage(category[CATEGORY_FIELDS.IMAGE]);
        }
        // Upload ảnh mới
        imagePath = await uploadImage(req.file, "categories");
      } else if (image_url && image_url !== category[CATEGORY_FIELDS.IMAGE]) {
        // Xóa ảnh cũ nếu có
        if (
          category[CATEGORY_FIELDS.IMAGE] &&
          !category[CATEGORY_FIELDS.IMAGE].startsWith("http")
        ) {
          await deleteImage(category[CATEGORY_FIELDS.IMAGE]);
        }
        // Tải ảnh từ URL
        imagePath = await downloadImageFromUrl(image_url, "categories");
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(name && { [CATEGORY_FIELDS.NAME]: name }),
        ...(slug && { [CATEGORY_FIELDS.SLUG]: slug.toLowerCase() }),
        ...(parent_id !== undefined && {
          [CATEGORY_FIELDS.PARENT_ID]: parent_id || null,
        }),
        ...(description !== undefined && {
          [CATEGORY_FIELDS.DESCRIPTION]: description,
        }),
        ...(imagePath !== undefined && { [CATEGORY_FIELDS.IMAGE]: imagePath }),
        ...(sort_order !== undefined && {
          [CATEGORY_FIELDS.SORT_ORDER]: parseInt(sort_order),
        }),
        ...(is_active !== undefined && {
          [CATEGORY_FIELDS.IS_ACTIVE]: Boolean(is_active),
        }),
        ...(meta_title !== undefined && {
          [CATEGORY_FIELDS.META_TITLE]: meta_title,
        }),
        ...(meta_description !== undefined && {
          [CATEGORY_FIELDS.META_DESCRIPTION]: meta_description,
        }),
      };

      await category.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất với relations
      const updatedCategory = await Category.findByPk(id, {
        include: [
          {
            model: Category,
            as: "parent",
            attributes: [
              CATEGORY_FIELDS.ID,
              CATEGORY_FIELDS.NAME,
              CATEGORY_FIELDS.SLUG,
            ],
          },
        ],
      });

      console.log(`✅ Đã cập nhật category thành công: ${name} (ID: ${id})`);

      return res.json({
        success: true,
        message: "Cập nhật danh mục thành công!",
        data: updatedCategory,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật category:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật danh mục.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA CATEGORY (SOFT DELETE)
  // =========================================================
  async deleteCategory(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa category ID: ${id}...`);

      const category = await Category.findByPk(id, { transaction });
      if (!category) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục.",
        });
      }

      // Kiểm tra xem category có sản phẩm không
      const productCount = await Product.count({
        where: { category_id: id },
        transaction,
      });

      if (productCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể xóa danh mục vì có ${productCount} sản phẩm đang sử dụng. Hãy chuyển sản phẩm sang danh mục khác trước.`,
        });
      }

      // Kiểm tra xem category có danh mục con không
      const childCount = await Category.count({
        where: { [CATEGORY_FIELDS.PARENT_ID]: id },
        transaction,
      });

      if (childCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể xóa danh mục vì có ${childCount} danh mục con. Hãy xóa hoặc chuyển danh mục con trước.`,
        });
      }

      // Xóa ảnh nếu có
      if (category[CATEGORY_FIELDS.IMAGE]) {
        await deleteImage(category[CATEGORY_FIELDS.IMAGE]);
      }

      // Xóa category
      await category.destroy({ transaction });
      await transaction.commit();

      console.log(
        `✅ Đã xóa category thành công: ${
          category[CATEGORY_FIELDS.NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Xóa danh mục thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa category:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa danh mục.",
      });
    }
  }

  // =========================================================
  // 🔄 ADMIN: THAY ĐỔI TRẠNG THÁI CATEGORY
  // =========================================================
  async toggleCategoryStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🔄 Đang thay đổi trạng thái category ID: ${id}...`);

      const category = await Category.findByPk(id, { transaction });
      if (!category) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục.",
        });
      }

      // Đảo ngược trạng thái
      const newStatus = !category[CATEGORY_FIELDS.IS_ACTIVE];
      await category.update(
        { [CATEGORY_FIELDS.IS_ACTIVE]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} category: ${
          category[CATEGORY_FIELDS.NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Kích hoạt" : "Vô hiệu hóa"
        } danh mục thành công!`,
        data: {
          id: category[CATEGORY_FIELDS.ID],
          name: category[CATEGORY_FIELDS.NAME],
          is_active: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái category:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái danh mục.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ CATEGORIES
  // =========================================================
  async getCategoryStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê categories...");

      const totalCategories = await Category.count();
      const activeCategories = await Category.count({
        where: { [CATEGORY_FIELDS.IS_ACTIVE]: true },
      });
      const inactiveCategories = totalCategories - activeCategories;

      const categoriesWithProducts = await Category.findAll({
        attributes: [
          CATEGORY_FIELDS.ID,
          CATEGORY_FIELDS.NAME,
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
        group: ["Category.id"],
        raw: true,
      });

      const parentCategories = await Category.count({
        where: { [CATEGORY_FIELDS.PARENT_ID]: null },
      });

      const childCategories = totalCategories - parentCategories;

      return res.json({
        success: true,
        message: "Lấy thống kê categories thành công",
        data: {
          total_categories: totalCategories,
          active_categories: activeCategories,
          inactive_categories: inactiveCategories,
          parent_categories: parentCategories,
          child_categories: childCategories,
          categories_with_products: categoriesWithProducts,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê categories:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê danh mục.",
      });
    }
  }
}

export default new CategoryController();

// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { CATEGORY_FIELDS };
