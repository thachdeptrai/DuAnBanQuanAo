// controllers/attributeValue.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { AttributeValue, Attribute, ProductAttribute, sequelize } = models;

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU ATTRIBUTE_VALUE MODEL
 */
const ATTRIBUTE_VALUE_FIELDS = {
  ID: "id",
  ATTRIBUTE_ID: "attribute_id",
  VALUE: "value",
  DISPLAY_VALUE: "display_value",
  COLOR_HEX: "color_hex",
  SORT_ORDER: "sort_order",
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
};

class AttributeValueController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH ATTRIBUTE VALUES (PHÂN TRANG & FILTER)
  // =========================================================
  async getAttributeValues(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        attribute_id,
        is_active,
        sortBy = ATTRIBUTE_VALUE_FIELDS.SORT_ORDER,
        sortOrder = "ASC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { [ATTRIBUTE_VALUE_FIELDS.VALUE]: { [Op.like]: `%${search}%` } },
          {
            [ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE]: {
              [Op.like]: `%${search}%`,
            },
          },
        ];
      }

      if (attribute_id) {
        where[ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID] = attribute_id;
      }

      if (is_active !== undefined) {
        where[ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE] = is_active === "true";
      }

      console.log(`📋 Admin đang lấy danh sách attribute values...`);

      const { count, rows: attributeValues } =
        await AttributeValue.findAndCountAll({
          where,
          include: [
            {
              model: Attribute,
              attributes: ["id", "name", "display_name", "is_active"],
              required: false,
            },
          ],
          order: [[sortBy, sortOrder.toUpperCase()]],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

      return res.json({
        success: true,
        message: `Lấy danh sách attribute values thành công. Tổng: ${count} values`,
        data: {
          attributeValues,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách attribute values:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // 👥 PUBLIC: LẤY DANH SÁCH ATTRIBUTE VALUES ACTIVE (CHO WEBSITE)
  // =========================================================
  async getActiveAttributeValues(req, res) {
    try {
      const { attribute_id } = req.query;

      console.log("🌐 Đang lấy danh sách attribute values active...");

      const where = {
        [ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE]: true,
      };

      if (attribute_id) {
        where[ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID] = attribute_id;
      }

      const attributeValues = await AttributeValue.findAll({
        where,
        include: [
          {
            model: Attribute,
            attributes: ["id", "name", "display_name"],
            where: { is_active: true },
            required: true,
          },
        ],
        order: [
          [ATTRIBUTE_VALUE_FIELDS.SORT_ORDER, "ASC"],
          [ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: "Lấy danh sách giá trị thuộc tính thành công",
        data: attributeValues,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách attribute values active:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY DANH SÁCH ATTRIBUTE VALUES THEO ATTRIBUTE ID
  // =========================================================
  async getValuesByAttributeId(req, res) {
    try {
      const { attribute_id } = req.params;

      console.log(`🔍 Đang lấy values cho attribute ID: ${attribute_id}`);

      const attribute = await Attribute.findByPk(attribute_id);
      if (!attribute) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      const attributeValues = await AttributeValue.findAll({
        where: {
          [ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID]: attribute_id,
        },
        order: [
          [ATTRIBUTE_VALUE_FIELDS.SORT_ORDER, "ASC"],
          [ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: `Lấy danh sách giá trị cho thuộc tính "${attribute.display_name}" thành công`,
        data: {
          attribute: {
            id: attribute.id,
            name: attribute.name,
            display_name: attribute.display_name,
          },
          values: attributeValues,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy values theo attribute ID:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT ATTRIBUTE VALUE THEO ID
  // =========================================================
  async getAttributeValueById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết attribute value ID: ${id}`);

      const attributeValue = await AttributeValue.findByPk(id, {
        include: [
          {
            model: Attribute,
            attributes: ["id", "name", "display_name", "is_active"],
          },
        ],
      });

      if (!attributeValue) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy giá trị thuộc tính.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin giá trị thuộc tính thành công",
        data: attributeValue,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết attribute value:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO ATTRIBUTE VALUE MỚI
  // =========================================================
  async createAttributeValue(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        attribute_id,
        value,
        display_value,
        color_hex,
        sort_order = 0,
        is_active = true,
      } = req.body;

      console.log("➕ Đang tạo attribute value mới...");

      // 🎯 Validation
      if (!attribute_id || !value || !display_value) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Attribute ID, giá trị và tên hiển thị là bắt buộc.",
        });
      }

      // Kiểm tra attribute tồn tại
      const attribute = await Attribute.findByPk(attribute_id, { transaction });
      if (!attribute) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      // Kiểm tra value trùng trong cùng attribute
      const existingValue = await AttributeValue.findOne({
        where: {
          [ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID]: attribute_id,
          [ATTRIBUTE_VALUE_FIELDS.VALUE]: value,
        },
        transaction,
      });

      if (existingValue) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Giá trị đã tồn tại trong thuộc tính này. Vui lòng chọn giá trị khác.",
        });
      }

      // 🗄️ Tạo attribute value
      const attributeValueData = {
        [ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID]: attribute_id,
        [ATTRIBUTE_VALUE_FIELDS.VALUE]: value.toLowerCase(),
        [ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE]: display_value,
        [ATTRIBUTE_VALUE_FIELDS.COLOR_HEX]: color_hex || null,
        [ATTRIBUTE_VALUE_FIELDS.SORT_ORDER]: parseInt(sort_order),
        [ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE]: Boolean(is_active),
      };

      const attributeValue = await AttributeValue.create(attributeValueData, {
        transaction,
      });

      await transaction.commit();

      console.log(
        `✅ Đã tạo attribute value thành công: ${display_value} (ID: ${
          attributeValue[ATTRIBUTE_VALUE_FIELDS.ID]
        })`
      );

      return res.status(201).json({
        success: true,
        message: "Tạo giá trị thuộc tính thành công!",
        data: attributeValue,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi tạo attribute value:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT ATTRIBUTE VALUE
  // =========================================================
  async updateAttributeValue(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { value, display_value, color_hex, sort_order, is_active } =
        req.body;

      console.log(`✏️ Đang cập nhật attribute value ID: ${id}...`);

      // Tìm attribute value
      const attributeValue = await AttributeValue.findByPk(id, { transaction });
      if (!attributeValue) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy giá trị thuộc tính.",
        });
      }

      // Kiểm tra value trùng trong cùng attribute (trừ chính nó)
      if (value && value !== attributeValue[ATTRIBUTE_VALUE_FIELDS.VALUE]) {
        const existingValue = await AttributeValue.findOne({
          where: {
            [ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID]:
              attributeValue[ATTRIBUTE_VALUE_FIELDS.ATTRIBUTE_ID],
            [ATTRIBUTE_VALUE_FIELDS.VALUE]: value,
            [ATTRIBUTE_VALUE_FIELDS.ID]: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingValue) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message:
              "Giá trị đã tồn tại trong thuộc tính này. Vui lòng chọn giá trị khác.",
          });
        }
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(value && { [ATTRIBUTE_VALUE_FIELDS.VALUE]: value.toLowerCase() }),
        ...(display_value && {
          [ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE]: display_value,
        }),
        ...(color_hex !== undefined && {
          [ATTRIBUTE_VALUE_FIELDS.COLOR_HEX]: color_hex,
        }),
        ...(sort_order !== undefined && {
          [ATTRIBUTE_VALUE_FIELDS.SORT_ORDER]: parseInt(sort_order),
        }),
        ...(is_active !== undefined && {
          [ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE]: Boolean(is_active),
        }),
      };

      await attributeValue.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất với attribute
      const updatedAttributeValue = await AttributeValue.findByPk(id, {
        include: [
          {
            model: Attribute,
            attributes: ["id", "name", "display_name"],
          },
        ],
      });

      console.log(
        `✅ Đã cập nhật attribute value thành công: ${display_value} (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Cập nhật giá trị thuộc tính thành công!",
        data: updatedAttributeValue,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật attribute value:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA ATTRIBUTE VALUE
  // =========================================================
  async deleteAttributeValue(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa attribute value ID: ${id}...`);

      const attributeValue = await AttributeValue.findByPk(id, { transaction });
      if (!attributeValue) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy giá trị thuộc tính.",
        });
      }

      // Kiểm tra xem attribute value có đang được sử dụng trong sản phẩm không
      const productAttributeCount = await ProductAttribute.count({
        where: { attribute_value_id: id },
        transaction,
      });

      if (productAttributeCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể xóa giá trị thuộc tính vì có ${productAttributeCount} sản phẩm đang sử dụng. Hãy xóa các liên kết trong sản phẩm trước.`,
        });
      }

      // Xóa attribute value
      await attributeValue.destroy({ transaction });
      await transaction.commit();

      console.log(
        `✅ Đã xóa attribute value thành công: ${
          attributeValue[ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Xóa giá trị thuộc tính thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa attribute value:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🔄 ADMIN: THAY ĐỔI TRẠNG THÁI ATTRIBUTE VALUE
  // =========================================================
  async toggleAttributeValueStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🔄 Đang thay đổi trạng thái attribute value ID: ${id}...`);

      const attributeValue = await AttributeValue.findByPk(id, { transaction });
      if (!attributeValue) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy giá trị thuộc tính.",
        });
      }

      // Đảo ngược trạng thái
      const newStatus = !attributeValue[ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE];
      await attributeValue.update(
        { [ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} attribute value: ${
          attributeValue[ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Kích hoạt" : "Vô hiệu hóa"
        } giá trị thuộc tính thành công!`,
        data: {
          id: attributeValue[ATTRIBUTE_VALUE_FIELDS.ID],
          display_value: attributeValue[ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE],
          is_active: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái attribute value:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái giá trị thuộc tính.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ ATTRIBUTE VALUES
  // =========================================================
  async getAttributeValueStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê attribute values...");

      const totalAttributeValues = await AttributeValue.count();
      const activeAttributeValues = await AttributeValue.count({
        where: { [ATTRIBUTE_VALUE_FIELDS.IS_ACTIVE]: true },
      });
      const inactiveAttributeValues =
        totalAttributeValues - activeAttributeValues;

      const valuesWithProducts = await AttributeValue.findAll({
        attributes: [
          ATTRIBUTE_VALUE_FIELDS.ID,
          ATTRIBUTE_VALUE_FIELDS.DISPLAY_VALUE,
          [
            sequelize.fn("COUNT", sequelize.col("product_attributes.id")),
            "usage_count",
          ],
        ],
        include: [
          {
            model: ProductAttribute,
            attributes: [],
            required: false,
          },
        ],
        group: ["AttributeValue.id"],
        raw: true,
      });

      // Thống kê theo attribute
      const valuesByAttribute = await AttributeValue.findAll({
        attributes: [
          "attribute_id",
          [sequelize.fn("COUNT", sequelize.col("id")), "value_count"],
        ],
        include: [
          {
            model: Attribute,
            attributes: ["display_name"],
            required: true,
          },
        ],
        group: ["attribute_id"],
        raw: true,
      });

      return res.json({
        success: true,
        message: "Lấy thống kê attribute values thành công",
        data: {
          total_attribute_values: totalAttributeValues,
          active_attribute_values: activeAttributeValues,
          inactive_attribute_values: inactiveAttributeValues,
          values_usage: valuesWithProducts,
          values_by_attribute: valuesByAttribute,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê attribute values:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê giá trị thuộc tính.",
      });
    }
  }
}

// ✅ Export đúng cách
const attributeValueController = new AttributeValueController();
export default attributeValueController;
