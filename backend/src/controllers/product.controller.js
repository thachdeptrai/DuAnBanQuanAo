// controllers/product.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { Product, Category, Brand, ProductVariant, ProductMedia, sequelize } =
  models;

// Utils
import {
  uploadImage,
  deleteImage,
  downloadImageFromUrl,
} from "../utils/imageUpload.js";

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU PRODUCT MODEL
 */
const PRODUCT_FIELDS = {
  ID: "id",
  NAME: "name",
  SLUG: "slug",
  DESCRIPTION: "description",
  SHORT_DESCRIPTION: "short_description",
  COST_PRICE: "cost_price",
  SKU_PREFIX: "sku_prefix",
  CATEGORY_ID: "category_id",
  BRAND_ID: "brand_id",
  IS_ACTIVE: "is_active",
  IS_FEATURED: "is_featured",
  IS_NEW: "is_new",
  AVERAGE_RATING: "average_rating",
  TOTAL_REVIEWS: "total_reviews",
  TOTAL_SALES: "total_sales",
  MIN_PRICE: "min_price",
  MAX_PRICE: "max_price",
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

class ProductController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH PRODUCTS (PHÂN TRANG & FILTER)
  // =========================================================
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        category_id,
        brand_id,
        is_active,
        is_featured,
        is_new,
        min_price,
        max_price,
        sortBy = PRODUCT_FIELDS.CREATED_AT,
        sortOrder = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { [PRODUCT_FIELDS.NAME]: { [Op.like]: `%${search}%` } },
          { [PRODUCT_FIELDS.SLUG]: { [Op.like]: `%${search}%` } },
          { [PRODUCT_FIELDS.DESCRIPTION]: { [Op.like]: `%${search}%` } },
          { [PRODUCT_FIELDS.SKU_PREFIX]: { [Op.like]: `%${search}%` } },
        ];
      }

      if (category_id) {
        where[PRODUCT_FIELDS.CATEGORY_ID] = category_id;
      }

      if (brand_id) {
        where[PRODUCT_FIELDS.BRAND_ID] = brand_id;
      }

      if (is_active !== undefined) {
        where[PRODUCT_FIELDS.IS_ACTIVE] = is_active === "true";
      }

      if (is_featured !== undefined) {
        where[PRODUCT_FIELDS.IS_FEATURED] = is_featured === "true";
      }

      if (is_new !== undefined) {
        where[PRODUCT_FIELDS.IS_NEW] = is_new === "true";
      }

      // Filter theo giá
      if (min_price || max_price) {
        where[PRODUCT_FIELDS.MIN_PRICE] = {};
        if (min_price)
          where[PRODUCT_FIELDS.MIN_PRICE][Op.gte] = parseFloat(min_price);
        if (max_price)
          where[PRODUCT_FIELDS.MIN_PRICE][Op.lte] = parseFloat(max_price);
      }

      console.log(`📋 Admin đang lấy danh sách products...`);

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            attributes: ["id", "name", "slug"],
            required: false,
          },
          {
            model: Brand,
            attributes: ["id", "name", "slug"],
            required: false,
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        message: `Lấy danh sách products thành công. Tổng: ${count} products`,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách products:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách sản phẩm.",
      });
    }
  }

  // =========================================================
  // 👥 PUBLIC: LẤY DANH SÁCH PRODUCTS ACTIVE (CHO WEBSITE)
  // =========================================================
  async getActiveProducts(req, res) {
    try {
      const {
        category_id,
        brand_id,
        is_featured,
        is_new,
        min_price,
        max_price,
        limit = 12,
        page = 1,
        sortBy = PRODUCT_FIELDS.CREATED_AT,
        sortOrder = "DESC",
      } = req.query;

      console.log("🌐 Đang lấy danh sách products active...");

      const offset = (page - 1) * limit;
      const where = {
        [PRODUCT_FIELDS.IS_ACTIVE]: true,
      };

      if (category_id) {
        where[PRODUCT_FIELDS.CATEGORY_ID] = category_id;
      }

      if (brand_id) {
        where[PRODUCT_FIELDS.BRAND_ID] = brand_id;
      }

      if (is_featured !== undefined) {
        where[PRODUCT_FIELDS.IS_FEATURED] = is_featured === "true";
      }

      if (is_new !== undefined) {
        where[PRODUCT_FIELDS.IS_NEW] = is_new === "true";
      }

      // Filter theo giá
      if (min_price || max_price) {
        where[PRODUCT_FIELDS.MIN_PRICE] = {};
        if (min_price)
          where[PRODUCT_FIELDS.MIN_PRICE][Op.gte] = parseFloat(min_price);
        if (max_price)
          where[PRODUCT_FIELDS.MIN_PRICE][Op.lte] = parseFloat(max_price);
      }

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            attributes: ["id", "name", "slug"],
            where: { is_active: true },
            required: false,
          },
          {
            model: Brand,
            attributes: ["id", "name", "slug"],
            where: { is_active: true },
            required: false,
          },
          {
            model: ProductMedia, // 💡 Đã sửa
            attributes: ["id", "file_path", "is_primary"], // 💡 Đã sửa image_url -> file_path
            where: { is_primary: true },
            required: false,
            limit: 1,
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách products active:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT PRODUCT THEO ID HOẶC SLUG
  // =========================================================
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết product: ${id}`);

      const where = {};
      if (isNaN(id)) {
        where[PRODUCT_FIELDS.SLUG] = id; // Nếu không phải số, tìm theo slug
      } else {
        where[PRODUCT_FIELDS.ID] = parseInt(id);
      }

      const product = await Product.findOne({
        where,
        include: [
          {
            model: Category,
            attributes: ["id", "name", "slug"],
            required: false,
          },
          {
            model: Brand,
            attributes: ["id", "name", "slug", "logo_url"],
            required: false,
          },
          {
            model: ProductMedia, // 💡 Đã sửa
            attributes: ["id", "file_path", "is_primary", "sort_order"],
            order: [
              ["is_primary", "DESC"],
              ["sort_order", "ASC"],
            ],
          },
          {
            model: ProductVariant,
            attributes: [
              "id",
              "sku",
              "price",
              "sale_price",
              "stock_quantity",
              "is_active",
            ],
            where: { is_active: true },
            required: false,
          },
        ],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết product:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin sản phẩm.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO PRODUCT MỚI
  // =========================================================
  async createProduct(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        name,
        slug,
        description,
        short_description,
        cost_price,
        sku_prefix,
        category_id,
        brand_id,
        is_active = true,
        is_featured = false,
        is_new = true,
        meta_title,
        meta_description,
        images, // Array of image URLs
      } = req.body;

      console.log("➕ Đang tạo product mới...");

      // 🎯 1. Validation Bắt buộc
      if (!name || !slug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Tên sản phẩm và slug là bắt buộc.",
        });
      }

      // 🎯 2. Kiểm tra Trùng lặp Slug
      const existingSlug = await Product.findOne({
        where: { [PRODUCT_FIELDS.SLUG]: slug.toLowerCase() },
        transaction,
      });

      if (existingSlug) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        });
      }

      // 🎯 3. Kiểm tra Khóa ngoại (Brand và Category)
      if (category_id) {
        const category = await Category.findByPk(category_id, { transaction });
        if (!category) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Danh mục không tồn tại.",
          });
        }
      }

      if (brand_id) {
        const brand = await Brand.findByPk(brand_id, { transaction });
        if (!brand) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Thương hiệu không tồn tại.",
          });
        }
      }

      // 🗄️ 4. Tạo Product Cơ bản
      const productData = {
        [PRODUCT_FIELDS.NAME]: name,
        [PRODUCT_FIELDS.SLUG]: slug.toLowerCase(),
        [PRODUCT_FIELDS.DESCRIPTION]: description || null,
        [PRODUCT_FIELDS.SHORT_DESCRIPTION]: short_description || null,
        [PRODUCT_FIELDS.COST_PRICE]: cost_price ? parseFloat(cost_price) : null,
        [PRODUCT_FIELDS.SKU_PREFIX]: sku_prefix || null,
        [PRODUCT_FIELDS.CATEGORY_ID]: category_id || null,
        [PRODUCT_FIELDS.BRAND_ID]: brand_id || null,
        [PRODUCT_FIELDS.IS_ACTIVE]: Boolean(is_active),
        [PRODUCT_FIELDS.IS_FEATURED]: Boolean(is_featured),
        [PRODUCT_FIELDS.IS_NEW]: Boolean(is_new),
        [PRODUCT_FIELDS.META_TITLE]: meta_title || name,
        [PRODUCT_FIELDS.META_DESCRIPTION]:
          meta_description || short_description?.substring(0, 255) || null,
        // Khởi tạo giá min/max bằng 0, sẽ được cập nhật sau khi tạo Variant
        [PRODUCT_FIELDS.MIN_PRICE]: 0.0,
        [PRODUCT_FIELDS.MAX_PRICE]: 0.0,
      };

      const product = await Product.create(productData, { transaction });

      // 🖼️ 5. Xử lý và Lưu Product Media (Đã cải tiến xử lý lỗi)
      if (images && images.length > 0) {
        const productMediaRecords = [];

        try {
          for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];
            let imagePath = null;
            let fileName = null;

            if (imageUrl.startsWith("http")) {
              // Tải ảnh từ URL. Giả định hàm này ném lỗi hoặc trả về null/false nếu thất bại
              imagePath = await downloadImageFromUrl(imageUrl, "products");
            }
            // else if (Xử lý Base64) { ... }

            if (!imagePath) {
              // Nếu downloadImageFromUrl thất bại hoặc trả về null
              throw new Error(`Không thể tải ảnh #${i + 1} từ URL.`);
            }

            // Lấy tên file từ đường dẫn đã lưu
            const pathParts = imagePath.split(/[\/\\]/);
            fileName = pathParts.pop();

            productMediaRecords.push({
              [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]: product.id,
              [PRODUCT_MEDIA_FIELDS.FILE_PATH]: imagePath,
              [PRODUCT_MEDIA_FIELDS.FILE_NAME]: fileName,
              [PRODUCT_MEDIA_FIELDS.MEDIA_TYPE]: "image",
              [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: i === 0,
              [PRODUCT_MEDIA_FIELDS.SORT_ORDER]: i,
            });
          }
        } catch (fileError) {
          // Bắt lỗi cụ thể liên quan đến file/URL và ROLLBACK NGAY LẬP TỨC
          await transaction.rollback();
          console.error("❌ Lỗi xử lý ảnh sản phẩm:", fileError);
          return res.status(500).json({
            success: false,
            message: `Lỗi xử lý hình ảnh sản phẩm: ${fileError.message}. Vui lòng kiểm tra lại URL ảnh.`,
          });
        }

        if (productMediaRecords.length > 0) {
          await ProductMedia.bulkCreate(productMediaRecords, { transaction });
        }
      }

      // 6. Commit Transaction
      await transaction.commit();

      console.log(
        `✅ Đã tạo product thành công: ${name} (ID: ${
          product[PRODUCT_FIELDS.ID]
        })`
      );

      // 7. Trả về Dữ liệu Chi tiết (Có include)
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          { model: Category, attributes: ["id", "name", "slug"] },
          { model: Brand, attributes: ["id", "name", "slug"] },
          {
            model: ProductMedia,
            attributes: [
              "id",
              "file_path",
              "is_primary",
              "media_type",
              "alt_text",
            ],
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công!",
        data: createdProduct,
      });
    } catch (error) {
      // 💡 Rollback An toàn: Chỉ rollback nếu giao dịch CHƯA được kết thúc
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }

      console.error("❌ Lỗi hệ thống khi tạo product:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo sản phẩm. Vui lòng thử lại sau.",
        error: error.message,
      });
    }
  }
  // =========================================================
  // ⚙️ STATIC UTILITY: CẬP NHẬT KHOẢNG GIÁ SẢN PHẨM
  // =========================================================
  static async updateProductPriceRange(productId, transaction) {
    // 1. Tìm giá MIN và MAX từ tất cả các biến thể đang hoạt động
    const priceRange = await ProductVariant.findAll({
      attributes: [
        [sequelize.fn("MIN", sequelize.col("price")), "minPrice"],
        [sequelize.fn("MAX", sequelize.col("price")), "maxPrice"],
      ],
      where: {
        product_id: productId,
        is_active: true,
      },
      group: ["product_id"], // Group theo product_id để đảm bảo chỉ có 1 row
      raw: true,
      transaction,
    });

    const minPrice = priceRange[0]?.minPrice || 0;
    const maxPrice = priceRange[0]?.maxPrice || 0;

    // 2. Cập nhật lại sản phẩm
    await Product.update(
      {
        [PRODUCT_FIELDS.MIN_PRICE]: minPrice,
        [PRODUCT_FIELDS.MAX_PRICE]: maxPrice,
      },
      {
        where: { [PRODUCT_FIELDS.ID]: productId },
        transaction,
      }
    );
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT PRODUCT
  // =========================================================
  async updateProduct(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        name,
        slug,
        description,
        short_description,
        cost_price,
        sku_prefix,
        category_id,
        brand_id,
        is_active,
        is_featured,
        is_new,
        meta_title,
        meta_description,
      } = req.body;

      console.log(`✏️ Đang cập nhật product ID: ${id}...`);

      // Tìm product
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // Kiểm tra slug trùng (trừ chính nó)
      if (slug && slug !== product[PRODUCT_FIELDS.SLUG]) {
        const existingSlug = await Product.findOne({
          where: {
            [PRODUCT_FIELDS.SLUG]: slug,
            [PRODUCT_FIELDS.ID]: { [Op.ne]: id },
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

      // Kiểm tra category tồn tại (nếu có)
      if (category_id) {
        const category = await Category.findByPk(category_id, { transaction });
        if (!category) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Danh mục không tồn tại.",
          });
        }
      }

      // Kiểm tra brand tồn tại (nếu có)
      if (brand_id) {
        const brand = await Brand.findByPk(brand_id, { transaction });
        if (!brand) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Thương hiệu không tồn tại.",
          });
        }
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(name && { [PRODUCT_FIELDS.NAME]: name }),
        ...(slug && { [PRODUCT_FIELDS.SLUG]: slug.toLowerCase() }),
        ...(description !== undefined && {
          [PRODUCT_FIELDS.DESCRIPTION]: description,
        }),
        ...(short_description !== undefined && {
          [PRODUCT_FIELDS.SHORT_DESCRIPTION]: short_description,
        }),
        ...(cost_price !== undefined && {
          [PRODUCT_FIELDS.COST_PRICE]: cost_price
            ? parseFloat(cost_price)
            : null,
        }),
        ...(sku_prefix !== undefined && {
          [PRODUCT_FIELDS.SKU_PREFIX]: sku_prefix,
        }),
        ...(category_id !== undefined && {
          [PRODUCT_FIELDS.CATEGORY_ID]: category_id || null,
        }),
        ...(brand_id !== undefined && {
          [PRODUCT_FIELDS.BRAND_ID]: brand_id || null,
        }),
        ...(is_active !== undefined && {
          [PRODUCT_FIELDS.IS_ACTIVE]: Boolean(is_active),
        }),
        ...(is_featured !== undefined && {
          [PRODUCT_FIELDS.IS_FEATURED]: Boolean(is_featured),
        }),
        ...(is_new !== undefined && {
          [PRODUCT_FIELDS.IS_NEW]: Boolean(is_new),
        }),
        ...(meta_title !== undefined && {
          [PRODUCT_FIELDS.META_TITLE]: meta_title,
        }),
        ...(meta_description !== undefined && {
          [PRODUCT_FIELDS.META_DESCRIPTION]: meta_description,
        }),
      };

      await product.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất
      const updatedProduct = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            attributes: ["id", "name", "slug"],
          },
          {
            model: Brand,
            attributes: ["id", "name", "slug"],
          },
        ],
      });

      console.log(`✅ Đã cập nhật product thành công: ${name} (ID: ${id})`);

      return res.json({
        success: true,
        message: "Cập nhật sản phẩm thành công!",
        data: updatedProduct,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật product:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA PRODUCT (SOFT DELETE)
  // =========================================================
  async deleteProduct(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa product ID: ${id}...`);

      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // Kiểm tra xem product có variants không
      const variantCount = await ProductVariant.count({
        where: { product_id: id },
        transaction,
      });

      if (variantCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể xóa sản phẩm vì có ${variantCount} biến thể. Hãy xóa biến thể trước.`,
        });
      }

      // Xóa ảnh sản phẩm
      const productImages = await ProductMedia.findAll({
        where: { product_id: id },
        transaction,
      });

      for (const image of productImages) {
        if (image.file_path) {
          await deleteImage(image.file_path);
        }
        await image.destroy({ transaction });
      }

      // Xóa product
      await product.destroy({ transaction });
      await transaction.commit();

      console.log(
        `✅ Đã xóa product thành công: ${
          product[PRODUCT_FIELDS.NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Xóa sản phẩm thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa product:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔄 ADMIN: THAY ĐỔI TRẠNG THÁI PRODUCT
  // =========================================================
  async toggleProductStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🔄 Đang thay đổi trạng thái product ID: ${id}...`);

      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // Đảo ngược trạng thái active
      const newStatus = !product[PRODUCT_FIELDS.IS_ACTIVE];
      await product.update(
        { [PRODUCT_FIELDS.IS_ACTIVE]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} product: ${
          product[PRODUCT_FIELDS.NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Kích hoạt" : "Vô hiệu hóa"
        } sản phẩm thành công!`,
        data: {
          id: product[PRODUCT_FIELDS.ID],
          name: product[PRODUCT_FIELDS.NAME],
          is_active: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái product:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái sản phẩm.",
      });
    }
  }

  // =========================================================
  // ⭐ ADMIN: ĐÁNH DẤU SẢN PHẨM NỔI BẬT
  // =========================================================
  async toggleProductFeatured(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`⭐ Đang thay đổi trạng thái featured product ID: ${id}...`);

      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // Đảo ngược trạng thái featured
      const newFeaturedStatus = !product[PRODUCT_FIELDS.IS_FEATURED];
      await product.update(
        { [PRODUCT_FIELDS.IS_FEATURED]: newFeaturedStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${
          newFeaturedStatus ? "đánh dấu" : "bỏ đánh dấu"
        } featured product: ${product[PRODUCT_FIELDS.NAME]} (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newFeaturedStatus ? "Đánh dấu" : "Bỏ đánh dấu"
        } sản phẩm nổi bật thành công!`,
        data: {
          id: product[PRODUCT_FIELDS.ID],
          name: product[PRODUCT_FIELDS.NAME],
          is_featured: newFeaturedStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái featured product:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái sản phẩm nổi bật.",
      });
    }
  }

  // =========================================================
  // 🆕 ADMIN: ĐÁNH DẤU SẢN PHẨM MỚI
  // =========================================================
  async toggleProductNew(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🆕 Đang thay đổi trạng thái new product ID: ${id}...`);

      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // Đảo ngược trạng thái new
      const newStatus = !product[PRODUCT_FIELDS.IS_NEW];
      await product.update(
        { [PRODUCT_FIELDS.IS_NEW]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "đánh dấu" : "bỏ đánh dấu"} new product: ${
          product[PRODUCT_FIELDS.NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Đánh dấu" : "Bỏ đánh dấu"
        } sản phẩm mới thành công!`,
        data: {
          id: product[PRODUCT_FIELDS.ID],
          name: product[PRODUCT_FIELDS.NAME],
          is_new: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái new product:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái sản phẩm mới.",
      });
    }
  }
  // =========================================================
  // 📊 ADMIN: THỐNG KÊ PRODUCTS
  // =========================================================
  async getProductStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê products...");

      const totalProducts = await Product.count();
      const activeProducts = await Product.count({
        where: { [PRODUCT_FIELDS.IS_ACTIVE]: true },
      });
      const inactiveProducts = totalProducts - activeProducts;
      const featuredProducts = await Product.count({
        where: { [PRODUCT_FIELDS.IS_FEATURED]: true },
      });
      const newProducts = await Product.count({
        where: { [PRODUCT_FIELDS.IS_NEW]: true },
      });

      // Thống kê theo category
      const productsByCategory = await Product.findAll({
        attributes: [
          "category_id",
          [sequelize.fn("COUNT", sequelize.col("id")), "product_count"],
        ],
        include: [
          {
            model: Category,
            attributes: ["name"],
            required: false,
          },
        ],
        group: ["category_id"],
        raw: true,
      });
      // Thống kê theo brand
      const productsByBrand = await Product.findAll({
        attributes: [
          "brand_id",
          [sequelize.fn("COUNT", sequelize.col("id")), "product_count"],
        ],
        include: [
          {
            model: Brand,
            attributes: ["name"],
            required: false,
          },
        ],
        group: ["brand_id"],
        raw: true,
      });

      return res.json({
        success: true,
        message: "Lấy thống kê products thành công",
        data: {
          total_products: totalProducts,
          active_products: activeProducts,
          inactive_products: inactiveProducts,
          featured_products: featuredProducts,
          new_products: newProducts,
          products_by_category: productsByCategory,
          products_by_brand: productsByBrand,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê products:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê sản phẩm.",
      });
    }
  }
}
// ✅ EXPORT ĐÚNG CÁCH - Tạo instance và export
const productController = new ProductController();
export default productController;
// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { PRODUCT_FIELDS, ProductController }; // 💡 ĐÃ SỬA
