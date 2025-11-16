// controllers/variantAttribute.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const {
  VariantAttribute,
  ProductVariant,
  Attribute,
  AttributeValue,
  Product,
  sequelize,
} = models;

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU VARIANT_ATTRIBUTE MODEL
 */
const VARIANT_ATTRIBUTE_FIELDS = {
  ID: "id",
  VARIANT_ID: "variant_id",
  ATTRIBUTE_ID: "attribute_id",
  ATTRIBUTE_VALUE_ID: "attribute_value_id",
};

class VariantAttributeController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH VARIANT ATTRIBUTES (PHÂN TRANG & FILTER)
  // =========================================================
  async getVariantAttributes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        variant_id,
        attribute_id,
        product_id,
        sortBy = VARIANT_ATTRIBUTE_FIELDS.ID,
        sortOrder = "ASC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (variant_id) {
        where[VARIANT_ATTRIBUTE_FIELDS.VARIANT_ID] = variant_id;
      }

      if (attribute_id) {
        where[VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_ID] = attribute_id;
      }

      console.log(`📋 Admin đang lấy danh sách variant attributes...`);

      // 🎯 Xây dựng include condition cho product_id filter
      const includeConditions = [
        {
          model: ProductVariant,
          attributes: ["id", "sku", "price"],
          include: product_id
            ? [
                {
                  model: Product,
                  attributes: ["id", "name", "slug"],
                  where: { id: product_id },
                  required: true,
                },
              ]
            : [
                {
                  model: Product,
                  attributes: ["id", "name", "slug"],
                  required: false,
                },
              ],
        },
        {
          model: Attribute,
          attributes: ["id", "name", "display_name"],
          required: false,
        },
        {
          model: AttributeValue,
          attributes: ["id", "value", "display_value", "color_hex"],
          required: false,
        },
      ];

      const { count, rows: variantAttributes } =
        await VariantAttribute.findAndCountAll({
          where,
          include: includeConditions,
          order: [[sortBy, sortOrder.toUpperCase()]],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

      return res.json({
        success: true,
        message: `Lấy danh sách variant attributes thành công. Tổng: ${count} attributes`,
        data: {
          variantAttributes,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách variant attributes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách thuộc tính biến thể.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY DANH SÁCH VARIANT ATTRIBUTES THEO VARIANT ID
  // =========================================================
  async getAttributesByVariantId(req, res) {
    try {
      const { variant_id } = req.params;

      console.log(`🔍 Đang lấy attributes cho variant ID: ${variant_id}`);

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

      const variantAttributes = await VariantAttribute.findAll({
        where: {
          [VARIANT_ATTRIBUTE_FIELDS.VARIANT_ID]: variant_id,
        },
        include: [
          {
            model: Attribute,
            attributes: ["id", "name", "display_name"],
            required: true,
          },
          {
            model: AttributeValue,
            attributes: ["id", "value", "display_value", "color_hex"],
            required: true,
          },
        ],
        order: [
          [Attribute, "sort_order", "ASC"],
          [AttributeValue, "sort_order", "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: `Lấy danh sách thuộc tính cho biến thể "${variant.sku}" thành công`,
        data: {
          variant: {
            id: variant.id,
            sku: variant.sku,
            product: variant.Product,
          },
          attributes: variantAttributes,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy attributes theo variant ID:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thuộc tính biến thể.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT VARIANT ATTRIBUTE THEO ID
  // =========================================================
  async getVariantAttributeById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết variant attribute ID: ${id}`);

      const variantAttribute = await VariantAttribute.findByPk(id, {
        include: [
          {
            model: ProductVariant,
            attributes: ["id", "sku", "price"],
            include: [
              {
                model: Product,
                attributes: ["id", "name", "slug"],
              },
            ],
          },
          {
            model: Attribute,
            attributes: ["id", "name", "display_name"],
          },
          {
            model: AttributeValue,
            attributes: ["id", "value", "display_value", "color_hex"],
          },
        ],
      });

      if (!variantAttribute) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính biến thể.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin thuộc tính biến thể thành công",
        data: variantAttribute,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết variant attribute:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin thuộc tính biến thể.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO VARIANT ATTRIBUTE MỚI
  // =========================================================
  async createVariantAttribute(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { variant_id, attribute_id, attribute_value_id } = req.body;

      console.log("➕ Đang tạo variant attribute mới...");
      // 🚨 LOGGING DỮ LIỆU ĐẦU VÀO
      console.log(
        `[VariantAttribute] Dữ liệu nhận được: { variant_id: ${variant_id}, attribute_id: ${attribute_id}, attribute_value_id: ${attribute_value_id} }`
      );

      // --- 🎯 BƯỚC 1: KIỂM TRA VALIDATION DỮ LIỆU BẮT BUỘC ---
      if (!variant_id || !attribute_id || !attribute_value_id) {
        await transaction.rollback();
        console.error("❌ Lỗi Validation: Thiếu một trong các ID bắt buộc.");
        return res.status(400).json({
          success: false,
          message:
            "Variant ID, Attribute ID và Attribute Value ID là bắt buộc.",
        });
      }

      // Chuyển đổi sang số nguyên để đảm bảo truy vấn chính xác
      const vId = parseInt(variant_id);
      const aId = parseInt(attribute_id);
      const avId = parseInt(attribute_value_id);

      // --- 🎯 BƯỚC 2: KIỂM TRA TỒN TẠI VÀ LIÊN KẾT ---

      // 2.1. Kiểm tra variant tồn tại
      const variant = await ProductVariant.findByPk(vId, { transaction });
      if (!variant) {
        await transaction.rollback();
        console.error(
          `❌ Lỗi 404: Không tìm thấy biến thể sản phẩm với ID: ${vId}`
        );
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm.",
        });
      }

      // 2.2. Kiểm tra attribute tồn tại
      const attribute = await Attribute.findByPk(aId, { transaction });
      if (!attribute) {
        await transaction.rollback();
        console.error(`❌ Lỗi 404: Không tìm thấy thuộc tính với ID: ${aId}`);
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      // 2.3. Kiểm tra attribute value tồn tại và thuộc về attribute
      const attributeValue = await AttributeValue.findOne({
        where: {
          id: avId,
          attribute_id: aId,
        },
        transaction,
      });

      if (!attributeValue) {
        await transaction.rollback();
        console.error(
          `❌ Lỗi 404: Giá trị thuộc tính ID ${avId} không tồn tại hoặc không thuộc về thuộc tính ID ${aId}.`
        );
        return res.status(404).json({
          success: false,
          message:
            "Không tìm thấy giá trị thuộc tính hoặc giá trị không thuộc về thuộc tính này.",
        });
      }

      // 2.4. Kiểm tra unique constraint (Mỗi variant chỉ có một giá trị cho một attribute)
      const existingVariantAttribute = await VariantAttribute.findOne({
        where: {
          [VARIANT_ATTRIBUTE_FIELDS.VARIANT_ID]: vId,
          [VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_ID]: aId,
        },
        transaction,
      });

      if (existingVariantAttribute) {
        await transaction.rollback();
        console.error(
          `❌ Lỗi 400: Biến thể ID ${vId} đã có thuộc tính ID ${aId}.`
        );
        return res.status(400).json({
          success: false,
          message:
            "Thuộc tính này đã được gán cho biến thể. Mỗi biến thể chỉ có một giá trị cho một thuộc tính.",
        });
      }

      // --- 🗄️ BƯỚC 3: TẠO DỮ LIỆU ---
      const variantAttributeData = {
        [VARIANT_ATTRIBUTE_FIELDS.VARIANT_ID]: vId,
        [VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_ID]: aId,
        [VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_VALUE_ID]: avId,
      };

      const variantAttribute = await VariantAttribute.create(
        variantAttributeData,
        { transaction }
      );

      await transaction.commit();

      console.log(
        `✅ Đã tạo variant attribute thành công: Variant ${vId} | Attribute ${aId} | Value ${avId} (ID: ${
          variantAttribute[VARIANT_ATTRIBUTE_FIELDS.ID]
        })`
      );

      // --- BƯỚC 4: TRẢ VỀ DỮ LIỆU BAO GỒM INCLUDE ---
      const createdVariantAttribute = await VariantAttribute.findByPk(
        variantAttribute.id,
        {
          include: [
            {
              model: ProductVariant,
              attributes: ["id", "sku"],
              include: [{ model: Product, attributes: ["id", "name"] }],
            },
            { model: Attribute, attributes: ["id", "name", "display_name"] },
            {
              model: AttributeValue,
              attributes: ["id", "value", "display_value", "color_hex"],
            },
          ],
        }
      );

      return res.status(201).json({
        success: true,
        message: "Tạo thuộc tính biến thể thành công!",
        data: createdVariantAttribute,
      });
    } catch (error) {
      // Rollback an toàn
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      console.error("❌ Lỗi hệ thống khi tạo variant attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo thuộc tính biến thể.",
        error: error.message, // Thêm error.message cho debug nhanh
      });
    }
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT VARIANT ATTRIBUTE
  // =========================================================
  async updateVariantAttribute(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { attribute_value_id } = req.body;

      console.log(`✏️ Đang cập nhật variant attribute ID: ${id}...`);

      // Tìm variant attribute
      const variantAttribute = await VariantAttribute.findByPk(id, {
        transaction,
      });
      if (!variantAttribute) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính biến thể.",
        });
      }

      // Kiểm tra attribute value tồn tại và thuộc về attribute
      if (attribute_value_id) {
        const attributeValue = await AttributeValue.findOne({
          where: {
            id: attribute_value_id,
            attribute_id:
              variantAttribute[VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_ID],
          },
          transaction,
        });

        if (!attributeValue) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message:
              "Không tìm thấy giá trị thuộc tính hoặc giá trị không thuộc về thuộc tính này.",
          });
        }
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(attribute_value_id && {
          [VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_VALUE_ID]: attribute_value_id,
        }),
      };

      await variantAttribute.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất
      const updatedVariantAttribute = await VariantAttribute.findByPk(id, {
        include: [
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
          {
            model: Attribute,
            attributes: ["id", "name", "display_name"],
          },
          {
            model: AttributeValue,
            attributes: ["id", "value", "display_value", "color_hex"],
          },
        ],
      });

      console.log(`✅ Đã cập nhật variant attribute thành công (ID: ${id})`);

      return res.json({
        success: true,
        message: "Cập nhật thuộc tính biến thể thành công!",
        data: updatedVariantAttribute,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật variant attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật thuộc tính biến thể.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA VARIANT ATTRIBUTE
  // =========================================================
  async deleteVariantAttribute(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa variant attribute ID: ${id}...`);

      const variantAttribute = await VariantAttribute.findByPk(id, {
        transaction,
      });
      if (!variantAttribute) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính biến thể.",
        });
      }

      // Xóa variant attribute
      await variantAttribute.destroy({ transaction });
      await transaction.commit();

      console.log(`✅ Đã xóa variant attribute thành công (ID: ${id})`);

      return res.json({
        success: true,
        message: "Xóa thuộc tính biến thể thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa variant attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa thuộc tính biến thể.",
      });
    }
  }

  // =========================================================
  // 🔍 TÌM KIẾM VARIANTS THEO ATTRIBUTE COMBINATION
  // =========================================================
  async findVariantsByAttributes(req, res) {
    try {
      const { attributes } = req.body; // [{attribute_id, attribute_value_id}, ...]

      if (
        !attributes ||
        !Array.isArray(attributes) ||
        attributes.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp danh sách thuộc tính.",
        });
      }

      console.log(
        `🔍 Đang tìm kiếm variants theo ${attributes.length} thuộc tính...`
      );

      // Tìm tất cả variants có chứa các attribute này
      const variantAttributes = await VariantAttribute.findAll({
        where: {
          [Op.or]: attributes.map((attr) => ({
            [VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_ID]: attr.attribute_id,
            [VARIANT_ATTRIBUTE_FIELDS.ATTRIBUTE_VALUE_ID]:
              attr.attribute_value_id,
          })),
        },
        include: [
          {
            model: ProductVariant,
            attributes: ["id", "sku", "price", "stock_quantity"],
            include: [
              {
                model: Product,
                attributes: ["id", "name", "slug"],
              },
            ],
          },
          {
            model: Attribute,
            attributes: ["id", "name", "display_name"],
          },
          {
            model: AttributeValue,
            attributes: ["id", "value", "display_value", "color_hex"],
          },
        ],
      });

      // Nhóm theo variant
      const variantsMap = new Map();
      variantAttributes.forEach((va) => {
        const variantId = va[VARIANT_ATTRIBUTE_FIELDS.VARIANT_ID];
        if (!variantsMap.has(variantId)) {
          variantsMap.set(variantId, {
            variant: va.ProductVariant,
            attributes: [],
          });
        }
        variantsMap.get(variantId).attributes.push({
          attribute: va.Attribute,
          attribute_value: va.AttributeValue,
        });
      });

      const variants = Array.from(variantsMap.values());

      return res.json({
        success: true,
        message: `Tìm thấy ${variants.length} biến thể phù hợp`,
        data: variants,
      });
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm variants theo attributes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tìm kiếm biến thể theo thuộc tính.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ VARIANT ATTRIBUTES
  // =========================================================
  async getVariantAttributeStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê variant attributes...");

      const totalVariantAttributes = await VariantAttribute.count();

      // Thống kê theo attribute
      const statsByAttribute = await VariantAttribute.findAll({
        attributes: [
          "attribute_id",
          [sequelize.fn("COUNT", sequelize.col("id")), "usage_count"],
        ],
        include: [
          {
            model: Attribute,
            attributes: ["name", "display_name"],
            required: true,
          },
        ],
        group: ["attribute_id"],
        raw: true,
      });

      // Thống kê theo variant
      const statsByVariant = await VariantAttribute.findAll({
        attributes: [
          "variant_id",
          [sequelize.fn("COUNT", sequelize.col("id")), "attribute_count"],
        ],
        include: [
          {
            model: ProductVariant,
            attributes: ["sku"],
            include: [
              {
                model: Product,
                attributes: ["name"],
              },
            ],
            required: true,
          },
        ],
        group: ["variant_id"],
        raw: true,
      });

      return res.json({
        success: true,
        message: "Lấy thống kê variant attributes thành công",
        data: {
          total_variant_attributes: totalVariantAttributes,
          usage_by_attribute: statsByAttribute,
          attributes_by_variant: statsByVariant,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê variant attributes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê thuộc tính biến thể.",
      });
    }
  }
}

// ✅ EXPORT ĐÚNG CÁCH - Tạo instance và export
const variantAttributeController = new VariantAttributeController();
export default variantAttributeController;

// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { VARIANT_ATTRIBUTE_FIELDS };
