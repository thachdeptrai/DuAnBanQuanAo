// controllers/productMedia.controller.js
import { Op } from "sequelize";
import models from "../model/init.js";
const { ProductMedia, Product, ProductVariant, sequelize } = models;

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU PRODUCT_MEDIA MODEL
 */
const PRODUCT_MEDIA_FIELDS = {
  ID: "id",
  PRODUCT_ID: "product_id",
  VARIANT_ID: "variant_id",
  FILE_NAME: "file_name",
  FILE_PATH: "file_path",
  FILE_SIZE: "file_size",
  MIME_TYPE: "mime_type",
  MEDIA_TYPE: "media_type",
  ALT_TEXT: "alt_text",
  SORT_ORDER: "sort_order",
  DURATION: "duration",
  THUMBNAIL_PATH: "thumbnail_path",
  IS_PRIMARY: "is_primary",
  CREATED_AT: "created_at",
};

class ProductMediaController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH PRODUCT MEDIA (PHÂN TRANG & FILTER)
  // =========================================================
  async getProductMedia(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        product_id,
        variant_id,
        media_type,
        sortBy = PRODUCT_MEDIA_FIELDS.SORT_ORDER,
        sortOrder = "ASC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (product_id) {
        where[PRODUCT_MEDIA_FIELDS.PRODUCT_ID] = product_id;
      }

      if (variant_id) {
        where[PRODUCT_MEDIA_FIELDS.VARIANT_ID] = variant_id;
      }

      if (media_type) {
        where[PRODUCT_MEDIA_FIELDS.MEDIA_TYPE] = media_type;
      }

      console.log(`📋 Admin đang lấy danh sách product media...`);

      const { count, rows: productMedia } = await ProductMedia.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug"],
            required: false,
          },
          {
            model: ProductVariant,
            attributes: ["id", "sku"],
            required: false,
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        message: `Lấy danh sách product media thành công. Tổng: ${count} media`,
        data: {
          productMedia,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách product media:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách media sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔍 USER: LẤY DANH SÁCH MEDIA THEO PRODUCT ID
  // =========================================================
  async getMediaByProductId(req, res) {
    try {
      const { product_id } = req.params;

      console.log(`🔍 Đang lấy media cho product ID: ${product_id}`);

      const product = await Product.findByPk(product_id, {
        attributes: ["id", "name", "slug"],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      const productMedia = await ProductMedia.findAll({
        where: {
          [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]: product_id,
        },
        include: [
          {
            model: ProductVariant,
            attributes: ["id", "sku"],
            required: false,
          },
        ],
        order: [
          [PRODUCT_MEDIA_FIELDS.IS_PRIMARY, "DESC"],
          [PRODUCT_MEDIA_FIELDS.SORT_ORDER, "ASC"],
          [PRODUCT_MEDIA_FIELDS.CREATED_AT, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: `Lấy danh sách media cho sản phẩm "${product.name}" thành công`,
        data: {
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
          },
          media: productMedia,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy media theo product ID:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy media sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔍 USER: LẤY DANH SÁCH MEDIA THEO VARIANT ID
  // =========================================================
  async getMediaByVariantId(req, res) {
    try {
      const { variant_id } = req.params;

      console.log(`🔍 Đang lấy media cho variant ID: ${variant_id}`);

      const variant = await ProductVariant.findByPk(variant_id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug"],
          },
        ],
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm.",
        });
      }

      const productMedia = await ProductMedia.findAll({
        where: {
          [PRODUCT_MEDIA_FIELDS.VARIANT_ID]: variant_id,
        },
        order: [
          [PRODUCT_MEDIA_FIELDS.SORT_ORDER, "ASC"],
          [PRODUCT_MEDIA_FIELDS.CREATED_AT, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: `Lấy danh sách media cho biến thể "${variant.sku}" thành công`,
        data: {
          variant: {
            id: variant.id,
            sku: variant.sku,
            product: variant.Product,
          },
          media: productMedia,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy media theo variant ID:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy media biến thể.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT PRODUCT MEDIA THEO ID
  // =========================================================
  async getProductMediaById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết product media ID: ${id}`);

      const productMedia = await ProductMedia.findByPk(id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug"],
          },
          {
            model: ProductVariant,
            attributes: ["id", "sku"],
            include: [
              {
                model: Product,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (!productMedia) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy media sản phẩm.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin media sản phẩm thành công",
        data: productMedia,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết product media:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin media sản phẩm.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO PRODUCT MEDIA MỚI
  // =========================================================
  async createProductMedia(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        product_id,
        variant_id,
        file_name,
        file_path,
        file_size,
        mime_type,
        media_type,
        alt_text,
        sort_order,
        duration,
        thumbnail_path,
        is_primary,
      } = req.body;

      console.log("➕ Đang tạo product media mới...");

      // 🚨 LOGGING DỮ LIỆU ĐẦU VÀO
      console.log(
        `[ProductMedia] Dữ liệu nhận được: { product_id: ${product_id}, variant_id: ${variant_id}, file_name: ${file_name} }`
      );

      // --- 🎯 BƯỚC 1: KIỂM TRA VALIDATION DỮ LIỆU BẮT BUỘC ---
      if (!product_id || !file_name || !file_path || !media_type) {
        await transaction.rollback();
        console.error("❌ Lỗi Validation: Thiếu dữ liệu bắt buộc.");
        return res.status(400).json({
          success: false,
          message:
            "Product ID, file name, file path và media type là bắt buộc.",
        });
      }

      // Chuyển đổi sang số nguyên
      const pId = parseInt(product_id);
      const vId = variant_id ? parseInt(variant_id) : null;

      // --- 🎯 BƯỚC 2: KIỂM TRA TỒN TẠI VÀ LIÊN KẾT ---

      // 2.1. Kiểm tra product tồn tại
      const product = await Product.findByPk(pId, { transaction });
      if (!product) {
        await transaction.rollback();
        console.error(`❌ Lỗi 404: Không tìm thấy sản phẩm với ID: ${pId}`);
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // 2.2. Kiểm tra variant tồn tại (nếu có)
      if (vId) {
        const variant = await ProductVariant.findOne({
          where: {
            id: vId,
            product_id: pId,
          },
          transaction,
        });

        if (!variant) {
          await transaction.rollback();
          console.error(
            `❌ Lỗi 404: Biến thể ID ${vId} không tồn tại hoặc không thuộc về sản phẩm ID ${pId}.`
          );
          return res.status(404).json({
            success: false,
            message:
              "Không tìm thấy biến thể hoặc biến thể không thuộc về sản phẩm này.",
          });
        }
      }

      // 2.3. Kiểm tra unique constraint (Mỗi product chỉ có một primary media)
      if (is_primary) {
        const existingPrimaryMedia = await ProductMedia.findOne({
          where: {
            [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]: pId,
            [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: true,
          },
          transaction,
        });

        if (existingPrimaryMedia) {
          await transaction.rollback();
          console.error(`❌ Lỗi 400: Sản phẩm ID ${pId} đã có media chính.`);
          return res.status(400).json({
            success: false,
            message:
              "Sản phẩm này đã có media chính. Mỗi sản phẩm chỉ có một media chính.",
          });
        }
      }

      // --- 🗄️ BƯỚC 3: TẠO DỮ LIỆU ---
      const productMediaData = {
        [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]: pId,
        [PRODUCT_MEDIA_FIELDS.VARIANT_ID]: vId,
        [PRODUCT_MEDIA_FIELDS.FILE_NAME]: file_name,
        [PRODUCT_MEDIA_FIELDS.FILE_PATH]: file_path,
        [PRODUCT_MEDIA_FIELDS.FILE_SIZE]: file_size,
        [PRODUCT_MEDIA_FIELDS.MIME_TYPE]: mime_type,
        [PRODUCT_MEDIA_FIELDS.MEDIA_TYPE]: media_type,
        [PRODUCT_MEDIA_FIELDS.ALT_TEXT]: alt_text,
        [PRODUCT_MEDIA_FIELDS.SORT_ORDER]: sort_order || 0,
        [PRODUCT_MEDIA_FIELDS.DURATION]: duration,
        [PRODUCT_MEDIA_FIELDS.THUMBNAIL_PATH]: thumbnail_path,
        [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: is_primary || false,
      };

      const productMedia = await ProductMedia.create(productMediaData, {
        transaction,
      });

      await transaction.commit();

      console.log(
        `✅ Đã tạo product media thành công: Product ${pId} | File ${file_name} (ID: ${
          productMedia[PRODUCT_MEDIA_FIELDS.ID]
        })`
      );

      // --- BƯỚC 4: TRẢ VỀ DỮ LIỆU BAO GỒM INCLUDE ---
      const createdProductMedia = await ProductMedia.findByPk(productMedia.id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name"],
          },
          {
            model: ProductVariant,
            attributes: ["id", "sku"],
          },
        ],
      });

      return res.status(201).json({
        success: true,
        message: "Tạo media sản phẩm thành công!",
        data: createdProductMedia,
      });
    } catch (error) {
      // Rollback an toàn
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      console.error("❌ Lỗi hệ thống khi tạo product media:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo media sản phẩm.",
        error: error.message,
      });
    }
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT PRODUCT MEDIA
  // =========================================================
  async updateProductMedia(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { alt_text, sort_order, is_primary, variant_id } = req.body;

      console.log(`✏️ Đang cập nhật product media ID: ${id}...`);

      // Tìm product media
      const productMedia = await ProductMedia.findByPk(id, {
        transaction,
      });
      if (!productMedia) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy media sản phẩm.",
        });
      }

      // Kiểm tra variant tồn tại nếu có variant_id
      if (variant_id) {
        const variant = await ProductVariant.findOne({
          where: {
            id: variant_id,
            product_id: productMedia[PRODUCT_MEDIA_FIELDS.PRODUCT_ID],
          },
          transaction,
        });

        if (!variant) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message:
              "Không tìm thấy biến thể hoặc biến thể không thuộc về sản phẩm này.",
          });
        }
      }

      // Kiểm tra unique constraint nếu set primary
      if (
        is_primary &&
        is_primary !== productMedia[PRODUCT_MEDIA_FIELDS.IS_PRIMARY]
      ) {
        const existingPrimaryMedia = await ProductMedia.findOne({
          where: {
            [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]:
              productMedia[PRODUCT_MEDIA_FIELDS.PRODUCT_ID],
            [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: true,
            [PRODUCT_MEDIA_FIELDS.ID]: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingPrimaryMedia) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Sản phẩm này đã có media chính. Mỗi sản phẩm chỉ có một media chính.",
          });
        }
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(alt_text !== undefined && {
          [PRODUCT_MEDIA_FIELDS.ALT_TEXT]: alt_text,
        }),
        ...(sort_order !== undefined && {
          [PRODUCT_MEDIA_FIELDS.SORT_ORDER]: sort_order,
        }),
        ...(is_primary !== undefined && {
          [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: is_primary,
        }),
        ...(variant_id !== undefined && {
          [PRODUCT_MEDIA_FIELDS.VARIANT_ID]: variant_id,
        }),
      };

      await productMedia.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất
      const updatedProductMedia = await ProductMedia.findByPk(id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name"],
          },
          {
            model: ProductVariant,
            attributes: ["id", "sku"],
          },
        ],
      });

      console.log(`✅ Đã cập nhật product media thành công (ID: ${id})`);

      return res.json({
        success: true,
        message: "Cập nhật media sản phẩm thành công!",
        data: updatedProductMedia,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật product media:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật media sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA PRODUCT MEDIA
  // =========================================================
  async deleteProductMedia(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa product media ID: ${id}...`);

      const productMedia = await ProductMedia.findByPk(id, {
        transaction,
      });
      if (!productMedia) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy media sản phẩm.",
        });
      }

      // Xóa product media
      await productMedia.destroy({ transaction });
      await transaction.commit();

      console.log(`✅ Đã xóa product media thành công (ID: ${id})`);

      return res.json({
        success: true,
        message: "Xóa media sản phẩm thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa product media:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa media sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🖼️ USER: LẤY PRIMARY MEDIA THEO PRODUCT ID
  // =========================================================
  async getPrimaryMediaByProductId(req, res) {
    try {
      const { product_id } = req.params;

      console.log(`🖼️ Đang lấy primary media cho product ID: ${product_id}`);

      const primaryMedia = await ProductMedia.findOne({
        where: {
          [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]: product_id,
          [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: true,
        },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug"],
          },
        ],
      });

      if (!primaryMedia) {
        // Nếu không có primary, lấy media đầu tiên
        const firstMedia = await ProductMedia.findOne({
          where: {
            [PRODUCT_MEDIA_FIELDS.PRODUCT_ID]: product_id,
          },
          order: [
            [PRODUCT_MEDIA_FIELDS.SORT_ORDER, "ASC"],
            [PRODUCT_MEDIA_FIELDS.CREATED_AT, "ASC"],
          ],
          include: [
            {
              model: Product,
              attributes: ["id", "name", "slug"],
            },
          ],
        });

        if (!firstMedia) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy media cho sản phẩm này.",
          });
        }

        return res.json({
          success: true,
          message: "Lấy media sản phẩm thành công",
          data: firstMedia,
          is_primary: false,
        });
      }

      return res.json({
        success: true,
        message: "Lấy primary media sản phẩm thành công",
        data: primaryMedia,
        is_primary: true,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy primary media:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy primary media.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ PRODUCT MEDIA
  // =========================================================
  async getProductMediaStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê product media...");

      const totalProductMedia = await ProductMedia.count();

      // Thống kê theo media type
      const statsByMediaType = await ProductMedia.findAll({
        attributes: [
          "media_type",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["media_type"],
        raw: true,
      });

      // Thống kê theo product
      const statsByProduct = await ProductMedia.findAll({
        attributes: [
          "product_id",
          [sequelize.fn("COUNT", sequelize.col("id")), "media_count"],
        ],
        include: [
          {
            model: Product,
            attributes: ["name"],
            required: true,
          },
        ],
        group: ["product_id"],
        raw: true,
      });

      // Thống kê primary media
      const primaryMediaCount = await ProductMedia.count({
        where: {
          [PRODUCT_MEDIA_FIELDS.IS_PRIMARY]: true,
        },
      });

      return res.json({
        success: true,
        message: "Lấy thống kê product media thành công",
        data: {
          total_product_media: totalProductMedia,
          media_by_type: statsByMediaType,
          media_by_product: statsByProduct,
          primary_media_count: primaryMediaCount,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê product media:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê media sản phẩm.",
      });
    }
  }
}

// ✅ EXPORT ĐÚNG CÁCH - Tạo instance và export
const productMediaController = new ProductMediaController();
export default productMediaController;

// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { PRODUCT_MEDIA_FIELDS };
