// controllers/productVariant.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { ProductVariant, Product, sequelize } = models;
import { ProductController } from "../controllers/product.controller.js"; // Cần import ProductController

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU PRODUCT_VARIANT MODEL
 */
const PRODUCT_VARIANT_FIELDS = {
  ID: "id",
  PRODUCT_ID: "product_id",
  SKU: "sku",
  PRICE: "price",
  COMPARE_PRICE: "compare_price",
  COST_PRICE: "cost_price",
  STOCK_QUANTITY: "stock_quantity",
  LOW_STOCK_ALERT: "low_stock_alert",
  IS_ACTIVE: "is_active",
  IS_DEFAULT: "is_default",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

class ProductVariantController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH PRODUCT VARIANTS (PHÂN TRANG & FILTER)
  // =========================================================
  async getProductVariants(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        product_id,
        is_active,
        low_stock_alert,
        sortBy = PRODUCT_VARIANT_FIELDS.CREATED_AT,
        sortOrder = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { [PRODUCT_VARIANT_FIELDS.SKU]: { [Op.like]: `%${search}%` } },
        ];
      }

      if (product_id) {
        where[PRODUCT_VARIANT_FIELDS.PRODUCT_ID] = product_id;
      }

      if (is_active !== undefined) {
        where[PRODUCT_VARIANT_FIELDS.IS_ACTIVE] = is_active === "true";
      }

      if (low_stock_alert !== undefined) {
        where[PRODUCT_VARIANT_FIELDS.LOW_STOCK_ALERT] =
          low_stock_alert === "true";
      }

      console.log(`📋 Admin đang lấy danh sách product variants...`);

      const { count, rows: variants } = await ProductVariant.findAndCountAll({
        where,
        include: [
          {
            model: Product,
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
        message: `Lấy danh sách product variants thành công. Tổng: ${count} variants`,
        data: {
          variants,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách product variants:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY DANH SÁCH VARIANTS THEO PRODUCT ID
  // =========================================================
  async getVariantsByProductId(req, res) {
    try {
      const { product_id } = req.params;

      console.log(`🔍 Đang lấy variants cho product ID: ${product_id}`);

      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      const variants = await ProductVariant.findAll({
        where: {
          [PRODUCT_VARIANT_FIELDS.PRODUCT_ID]: product_id,
        },
        order: [
          [PRODUCT_VARIANT_FIELDS.IS_DEFAULT, "DESC"],
          [PRODUCT_VARIANT_FIELDS.CREATED_AT, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: `Lấy danh sách biến thể cho sản phẩm "${product.name}" thành công`,
        data: {
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
          },
          variants,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy variants theo product ID:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT PRODUCT VARIANT THEO ID
  // =========================================================
  async getProductVariantById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết product variant ID: ${id}`);

      const variant = await ProductVariant.findByPk(id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug", "is_active"],
          },
        ],
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin biến thể sản phẩm thành công",
        data: variant,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết product variant:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO PRODUCT VARIANT MỚI
  // =========================================================
  async createProductVariant(req, res) {
    // 💡 Đảm bảo rằng hàm này được đặt trong một Class Controller để dùng 'this'
    const transaction = await sequelize.transaction();

    try {
      const {
        product_id,
        sku,
        price,
        compare_price,
        cost_price,
        stock_quantity = 0,
        low_stock_alert = false,
        is_active = true,
        is_default = false,
      } = req.body;

      console.log("➕ Đang tạo product variant mới...");

      // 🎯 1. Validation Bắt buộc
      if (!product_id || !sku || !price) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Product ID, SKU và giá là bắt buộc.",
        });
      }

      // 🎯 2. Chuyển đổi giá trị số an toàn
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Giá (price) phải là một số dương hợp lệ.",
        });
      }

      // 🎯 3. Kiểm tra Product tồn tại
      const product = await Product.findByPk(product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm.",
        });
      }

      // 🎯 4. Kiểm tra SKU trùng (trên toàn hệ thống)
      const existingSku = await ProductVariant.findOne({
        where: { [PRODUCT_VARIANT_FIELDS.SKU]: sku },
        transaction,
      });

      if (existingSku) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "SKU đã tồn tại. Vui lòng chọn SKU khác.",
        });
      }

      // 🎯 5. Xử lý is_default: Bỏ mặc định của các variant khác nếu variant hiện tại là mặc định
      const isVariantDefault = Boolean(is_default);

      if (isVariantDefault) {
        await ProductVariant.update(
          { [PRODUCT_VARIANT_FIELDS.IS_DEFAULT]: false },
          {
            where: { [PRODUCT_VARIANT_FIELDS.PRODUCT_ID]: product_id },
            transaction,
          }
        );
      }

      // 🗄️ 6. Tạo product variant
      const variantData = {
        [PRODUCT_VARIANT_FIELDS.PRODUCT_ID]: product_id,
        [PRODUCT_VARIANT_FIELDS.SKU]: sku,
        [PRODUCT_VARIANT_FIELDS.PRICE]: parsedPrice,
        [PRODUCT_VARIANT_FIELDS.COMPARE_PRICE]: compare_price
          ? parseFloat(compare_price)
          : null,
        [PRODUCT_VARIANT_FIELDS.COST_PRICE]: cost_price
          ? parseFloat(cost_price)
          : null,
        [PRODUCT_VARIANT_FIELDS.STOCK_QUANTITY]: parseInt(stock_quantity) || 0,
        [PRODUCT_VARIANT_FIELDS.LOW_STOCK_ALERT]: Boolean(low_stock_alert),
        [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: Boolean(is_active),
        [PRODUCT_VARIANT_FIELDS.IS_DEFAULT]: isVariantDefault,
      };

      const variant = await ProductVariant.create(variantData, { transaction });

      // 🎯 7. Cập nhật dải giá sản phẩm cha (Product Price Range)
      // Lưu ý: Nếu updateProductPriceRange là phương thức của class, hãy dùng 'this'
      // Nếu là hàm độc lập, hãy dùng tên hàm đã import
      await this.updateProductPriceRange(product_id, transaction);

      // 8. Commit Transaction
      await transaction.commit();

      console.log(
        `✅ Đã tạo product variant thành công: ${sku} (ID: ${
          variant[PRODUCT_VARIANT_FIELDS.ID]
        })`
      );

      // 9. Trả về dữ liệu chi tiết hơn (có thể bao gồm VariantAttribute nếu cần)
      // Hiện tại, trả về variant cơ bản là đủ
      return res.status(201).json({
        success: true,
        message: "Tạo biến thể sản phẩm thành công!",
        data: variant,
      });
    } catch (error) {
      // Rollback an toàn
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }

      console.error("❌ Lỗi khi tạo product variant:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo biến thể sản phẩm.",
        error: error.message,
      });
    }
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT PRODUCT VARIANT
  // =========================================================
  async updateProductVariant(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        sku,
        price,
        compare_price,
        cost_price,
        stock_quantity,
        low_stock_alert,
        is_active,
        is_default,
      } = req.body;

      console.log(`✏️ Đang cập nhật product variant ID: ${id}...`);

      // Tìm variant
      const variant = await ProductVariant.findByPk(id, { transaction });
      if (!variant) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm.",
        });
      }

      // Kiểm tra SKU trùng (trừ chính nó)
      if (sku && sku !== variant[PRODUCT_VARIANT_FIELDS.SKU]) {
        const existingSku = await ProductVariant.findOne({
          where: {
            [PRODUCT_VARIANT_FIELDS.SKU]: sku,
            [PRODUCT_VARIANT_FIELDS.ID]: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingSku) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "SKU đã tồn tại. Vui lòng chọn SKU khác.",
          });
        }
      }

      // Nếu là variant mặc định, bỏ mặc định của các variant khác
      if (is_default && !variant[PRODUCT_VARIANT_FIELDS.IS_DEFAULT]) {
        await ProductVariant.update(
          { [PRODUCT_VARIANT_FIELDS.IS_DEFAULT]: false },
          {
            where: {
              [PRODUCT_VARIANT_FIELDS.PRODUCT_ID]:
                variant[PRODUCT_VARIANT_FIELDS.PRODUCT_ID],
              [PRODUCT_VARIANT_FIELDS.ID]: { [Op.ne]: id },
            },
            transaction,
          }
        );
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(sku && { [PRODUCT_VARIANT_FIELDS.SKU]: sku }),
        ...(price !== undefined && {
          [PRODUCT_VARIANT_FIELDS.PRICE]: parseFloat(price),
        }),
        ...(compare_price !== undefined && {
          [PRODUCT_VARIANT_FIELDS.COMPARE_PRICE]: compare_price
            ? parseFloat(compare_price)
            : null,
        }),
        ...(cost_price !== undefined && {
          [PRODUCT_VARIANT_FIELDS.COST_PRICE]: cost_price
            ? parseFloat(cost_price)
            : null,
        }),
        ...(stock_quantity !== undefined && {
          [PRODUCT_VARIANT_FIELDS.STOCK_QUANTITY]: parseInt(stock_quantity),
        }),
        ...(low_stock_alert !== undefined && {
          [PRODUCT_VARIANT_FIELDS.LOW_STOCK_ALERT]: Boolean(low_stock_alert),
        }),
        ...(is_active !== undefined && {
          [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: Boolean(is_active),
        }),
        ...(is_default !== undefined && {
          [PRODUCT_VARIANT_FIELDS.IS_DEFAULT]: Boolean(is_default),
        }),
      };

      await variant.update(updateData, { transaction });

      // Cập nhật min_price, max_price cho product
      await this.updateProductPriceRange(
        variant[PRODUCT_VARIANT_FIELDS.PRODUCT_ID],
        transaction
      );

      await transaction.commit();

      // Lấy lại thông tin mới nhất
      const updatedVariant = await ProductVariant.findByPk(id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug"],
          },
        ],
      });

      console.log(
        `✅ Đã cập nhật product variant thành công: ${sku} (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Cập nhật biến thể sản phẩm thành công!",
        data: updatedVariant,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật product variant:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA PRODUCT VARIANT
  // =========================================================
  async deleteProductVariant(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa product variant ID: ${id}...`);

      const variant = await ProductVariant.findByPk(id, { transaction });
      if (!variant) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm.",
        });
      }

      const productId = variant[PRODUCT_VARIANT_FIELDS.PRODUCT_ID];
      const isDefaultVariant = variant[PRODUCT_VARIANT_FIELDS.IS_DEFAULT];

      // Xóa variant
      await variant.destroy({ transaction });

      // Nếu xóa variant mặc định, chọn variant khác làm mặc định
      if (isDefaultVariant) {
        const firstVariant = await ProductVariant.findOne({
          where: {
            [PRODUCT_VARIANT_FIELDS.PRODUCT_ID]: productId,
            [PRODUCT_VARIANT_FIELDS.ID]: { [Op.ne]: id },
          },
          transaction,
          order: [[PRODUCT_VARIANT_FIELDS.CREATED_AT, "ASC"]],
        });

        if (firstVariant) {
          await firstVariant.update(
            { [PRODUCT_VARIANT_FIELDS.IS_DEFAULT]: true },
            { transaction }
          );
        }
      }

      // Cập nhật min_price, max_price cho product
      await this.updateProductPriceRange(productId, transaction);

      await transaction.commit();

      console.log(
        `✅ Đã xóa product variant thành công: ${
          variant[PRODUCT_VARIANT_FIELDS.SKU]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Xóa biến thể sản phẩm thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa product variant:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔄 ADMIN: THAY ĐỔI TRẠNG THÁI PRODUCT VARIANT
  // =========================================================
  async toggleProductVariantStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🔄 Đang thay đổi trạng thái product variant ID: ${id}...`);

      const variant = await ProductVariant.findByPk(id, { transaction });
      if (!variant) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm.",
        });
      }

      // Đảo ngược trạng thái active
      const newStatus = !variant[PRODUCT_VARIANT_FIELDS.IS_ACTIVE];
      await variant.update(
        { [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} product variant: ${
          variant[PRODUCT_VARIANT_FIELDS.SKU]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Kích hoạt" : "Vô hiệu hóa"
        } biến thể sản phẩm thành công!`,
        data: {
          id: variant[PRODUCT_VARIANT_FIELDS.ID],
          sku: variant[PRODUCT_VARIANT_FIELDS.SKU],
          is_active: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái product variant:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // ⚠️ ADMIN: CẢNH BÁO TỒN KHO THẤP
  // =========================================================
  async getLowStockVariants(req, res) {
    try {
      const { threshold = 10 } = req.query;

      console.log(
        `⚠️ Đang lấy danh sách variants tồn kho thấp (ngưỡng: ${threshold})...`
      );

      const lowStockVariants = await ProductVariant.findAll({
        where: {
          [PRODUCT_VARIANT_FIELDS.STOCK_QUANTITY]: {
            [Op.lte]: parseInt(threshold),
          },
          [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: true,
        },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "slug"],
            where: { is_active: true },
            required: true,
          },
        ],
        order: [
          [PRODUCT_VARIANT_FIELDS.STOCK_QUANTITY, "ASC"],
          [PRODUCT, "name", "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: `Tìm thấy ${lowStockVariants.length} biến thể tồn kho thấp`,
        data: lowStockVariants,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách variants tồn kho thấp:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách biến thể tồn kho thấp.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ PRODUCT VARIANTS
  // =========================================================
  async getProductVariantStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê product variants...");

      const totalVariants = await ProductVariant.count();
      const activeVariants = await ProductVariant.count({
        where: { [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: true },
      });
      const inactiveVariants = totalVariants - activeVariants;
      const lowStockVariants = await ProductVariant.count({
        where: {
          [PRODUCT_VARIANT_FIELDS.LOW_STOCK_ALERT]: true,
          [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: true,
        },
      });
      const outOfStockVariants = await ProductVariant.count({
        where: {
          [PRODUCT_VARIANT_FIELDS.STOCK_QUANTITY]: 0,
          [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: true,
        },
      });

      // Thống kê tổng giá trị tồn kho
      const inventoryValue = await ProductVariant.sum(
        PRODUCT_VARIANT_FIELDS.COST_PRICE,
        {
          where: { [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: true },
        }
      );

      return res.json({
        success: true,
        message: "Lấy thống kê product variants thành công",
        data: {
          total_variants: totalVariants,
          active_variants: activeVariants,
          inactive_variants: inactiveVariants,
          low_stock_variants: lowStockVariants,
          out_of_stock_variants: outOfStockVariants,
          total_inventory_value: inventoryValue || 0,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê product variants:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê biến thể sản phẩm.",
      });
    }
  }

  // =========================================================
  // 🔧 TIỆN ÍCH: CẬP NHẬT GIÁ SẢN PHẨM
  // =========================================================
  async updateProductPriceRange(productId, transaction) {
    try {
      const priceStats = await ProductVariant.findOne({
        attributes: [
          [
            sequelize.fn("MIN", sequelize.col(PRODUCT_VARIANT_FIELDS.PRICE)),
            "min_price",
          ],
          [
            sequelize.fn("MAX", sequelize.col(PRODUCT_VARIANT_FIELDS.PRICE)),
            "max_price",
          ],
        ],
        where: {
          [PRODUCT_VARIANT_FIELDS.PRODUCT_ID]: productId,
          [PRODUCT_VARIANT_FIELDS.IS_ACTIVE]: true,
        },
        transaction,
        raw: true,
      });

      await Product.update(
        {
          [PRODUCT_FIELDS.MIN_PRICE]: priceStats.min_price || 0,
          [PRODUCT_FIELDS.MAX_PRICE]: priceStats.max_price || 0,
        },
        {
          where: { id: productId },
          transaction,
        }
      );
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật giá sản phẩm:", error);
      throw error;
    }
  }
}

// ✅ EXPORT ĐÚNG CÁCH - Tạo instance và export
const productVariantController = new ProductVariantController();
export default productVariantController;

// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { PRODUCT_VARIANT_FIELDS };
