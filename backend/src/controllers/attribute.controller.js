// controllers/attribute.controller.js
import { Op } from "sequelize";

// Models
import models from "../model/init.js";
const { Attribute, ProductAttribute, Product, sequelize } = models;

/**
 * 🎯 DANH SÁCH TRƯỜNG DỮ LIỆU ATTRIBUTE MODEL
 */
const ATTRIBUTE_FIELDS = {
  ID: "id",
  NAME: "name",
  DISPLAY_NAME: "display_name",
  SORT_ORDER: "sort_order",
  IS_ACTIVE: "is_active",
  CREATED_AT: "created_at",
};

class AttributeController {
  // =========================================================
  // 📋 ADMIN: LẤY DANH SÁCH ATTRIBUTES (PHÂN TRANG & FILTER)
  // =========================================================
  async getAttributes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        is_active,
        sortBy = ATTRIBUTE_FIELDS.SORT_ORDER,
        sortOrder = "ASC",
      } = req.query;

      const offset = (page - 1) * limit;

      // 🎯 Xây dựng điều kiện WHERE
      const where = {};

      if (search) {
        where[Op.or] = [
          { [ATTRIBUTE_FIELDS.NAME]: { [Op.like]: `%${search}%` } },
          { [ATTRIBUTE_FIELDS.DISPLAY_NAME]: { [Op.like]: `%${search}%` } },
        ];
      }

      if (is_active !== undefined) {
        where[ATTRIBUTE_FIELDS.IS_ACTIVE] = is_active === "true";
      }

      console.log(`📋 Admin đang lấy danh sách attributes...`);

      const { count, rows: attributes } = await Attribute.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        message: `Lấy danh sách attributes thành công. Tổng: ${count} attributes`,
        data: {
          attributes,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách attributes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách thuộc tính.",
      });
    }
  }

  // =========================================================
  // 👥 PUBLIC: LẤY DANH SÁCH ATTRIBUTES ACTIVE (CHO WEBSITE)
  // =========================================================
  async getActiveAttributes(req, res) {
    try {
      console.log("🌐 Đang lấy danh sách attributes active...");

      const attributes = await Attribute.findAll({
        where: {
          [ATTRIBUTE_FIELDS.IS_ACTIVE]: true,
        },
        order: [
          [ATTRIBUTE_FIELDS.SORT_ORDER, "ASC"],
          [ATTRIBUTE_FIELDS.DISPLAY_NAME, "ASC"],
        ],
      });

      return res.json({
        success: true,
        message: "Lấy danh sách thuộc tính thành công",
        data: attributes,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách attributes active:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🔍 LẤY CHI TIẾT ATTRIBUTE THEO ID
  // =========================================================
  async getAttributeById(req, res) {
    try {
      const { id } = req.params;

      console.log(`🔍 Đang lấy chi tiết attribute ID: ${id}`);

      const attribute = await Attribute.findByPk(id);

      if (!attribute) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      return res.json({
        success: true,
        message: "Lấy thông tin thuộc tính thành công",
        data: attribute,
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết attribute:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin thuộc tính.",
      });
    }
  }

  // =========================================================
  // ➕ ADMIN: TẠO ATTRIBUTE MỚI
  // =========================================================
  async createAttribute(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { name, display_name, sort_order = 0, is_active = true } = req.body;

      console.log("➕ Đang tạo attribute mới...");

      // 🎯 Validation
      if (!name || !display_name) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Tên thuộc tính và tên hiển thị là bắt buộc.",
        });
      }

      // Kiểm tra name trùng
      const existingName = await Attribute.findOne({
        where: { [ATTRIBUTE_FIELDS.NAME]: name },
        transaction,
      });

      if (existingName) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Tên thuộc tính đã tồn tại. Vui lòng chọn tên khác.",
        });
      }

      // 🗄️ Tạo attribute
      const attributeData = {
        [ATTRIBUTE_FIELDS.NAME]: name.toLowerCase(),
        [ATTRIBUTE_FIELDS.DISPLAY_NAME]: display_name,
        [ATTRIBUTE_FIELDS.SORT_ORDER]: parseInt(sort_order),
        [ATTRIBUTE_FIELDS.IS_ACTIVE]: Boolean(is_active),
      };

      const attribute = await Attribute.create(attributeData, { transaction });

      await transaction.commit();

      console.log(
        `✅ Đã tạo attribute thành công: ${display_name} (ID: ${
          attribute[ATTRIBUTE_FIELDS.ID]
        })`
      );

      return res.status(201).json({
        success: true,
        message: "Tạo thuộc tính thành công!",
        data: attribute,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi tạo attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo thuộc tính.",
      });
    }
  }

  // =========================================================
  // ✏️ ADMIN: CẬP NHẬT ATTRIBUTE
  // =========================================================
  async updateAttribute(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { name, display_name, sort_order, is_active } = req.body;

      console.log(`✏️ Đang cập nhật attribute ID: ${id}...`);

      // Tìm attribute
      const attribute = await Attribute.findByPk(id, { transaction });
      if (!attribute) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      // Kiểm tra name trùng (trừ chính nó)
      if (name && name !== attribute[ATTRIBUTE_FIELDS.NAME]) {
        const existingName = await Attribute.findOne({
          where: {
            [ATTRIBUTE_FIELDS.NAME]: name,
            [ATTRIBUTE_FIELDS.ID]: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingName) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: "Tên thuộc tính đã tồn tại. Vui lòng chọn tên khác.",
          });
        }
      }

      // 📝 Cập nhật thông tin
      const updateData = {
        ...(name && { [ATTRIBUTE_FIELDS.NAME]: name.toLowerCase() }),
        ...(display_name && { [ATTRIBUTE_FIELDS.DISPLAY_NAME]: display_name }),
        ...(sort_order !== undefined && {
          [ATTRIBUTE_FIELDS.SORT_ORDER]: parseInt(sort_order),
        }),
        ...(is_active !== undefined && {
          [ATTRIBUTE_FIELDS.IS_ACTIVE]: Boolean(is_active),
        }),
      };

      await attribute.update(updateData, { transaction });
      await transaction.commit();

      // Lấy lại thông tin mới nhất
      const updatedAttribute = await Attribute.findByPk(id);

      console.log(
        `✅ Đã cập nhật attribute thành công: ${display_name} (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Cập nhật thuộc tính thành công!",
        data: updatedAttribute,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi cập nhật attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🗑️ ADMIN: XÓA ATTRIBUTE
  // =========================================================
  async deleteAttribute(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🗑️ Đang xóa attribute ID: ${id}...`);

      const attribute = await Attribute.findByPk(id, { transaction });
      if (!attribute) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      // Kiểm tra xem attribute có đang được sử dụng trong sản phẩm không
      const productAttributeCount = await ProductAttribute.count({
        where: { attribute_id: id },
        transaction,
      });

      if (productAttributeCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Không thể xóa thuộc tính vì có ${productAttributeCount} sản phẩm đang sử dụng. Hãy xóa các giá trị thuộc tính trong sản phẩm trước.`,
        });
      }

      // Xóa attribute
      await attribute.destroy({ transaction });
      await transaction.commit();

      console.log(
        `✅ Đã xóa attribute thành công: ${
          attribute[ATTRIBUTE_FIELDS.DISPLAY_NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: "Xóa thuộc tính thành công!",
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi xóa attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🔄 ADMIN: THAY ĐỔI TRẠNG THÁI ATTRIBUTE
  // =========================================================
  async toggleAttributeStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      console.log(`🔄 Đang thay đổi trạng thái attribute ID: ${id}...`);

      const attribute = await Attribute.findByPk(id, { transaction });
      if (!attribute) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thuộc tính.",
        });
      }

      // Đảo ngược trạng thái
      const newStatus = !attribute[ATTRIBUTE_FIELDS.IS_ACTIVE];
      await attribute.update(
        { [ATTRIBUTE_FIELDS.IS_ACTIVE]: newStatus },
        { transaction }
      );
      await transaction.commit();

      console.log(
        `✅ Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} attribute: ${
          attribute[ATTRIBUTE_FIELDS.DISPLAY_NAME]
        } (ID: ${id})`
      );

      return res.json({
        success: true,
        message: `${
          newStatus ? "Kích hoạt" : "Vô hiệu hóa"
        } thuộc tính thành công!`,
        data: {
          id: attribute[ATTRIBUTE_FIELDS.ID],
          name: attribute[ATTRIBUTE_FIELDS.DISPLAY_NAME],
          is_active: newStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Lỗi khi thay đổi trạng thái attribute:", error);

      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi thay đổi trạng thái thuộc tính.",
      });
    }
  }

  // =========================================================
  // 📊 ADMIN: THỐNG KÊ ATTRIBUTES
  // =========================================================
  async getAttributeStats(req, res) {
    try {
      console.log("📊 Đang lấy thống kê attributes...");

      const totalAttributes = await Attribute.count();
      const activeAttributes = await Attribute.count({
        where: { [ATTRIBUTE_FIELDS.IS_ACTIVE]: true },
      });
      const inactiveAttributes = totalAttributes - activeAttributes;

      const attributesWithProducts = await Attribute.findAll({
        attributes: [
          ATTRIBUTE_FIELDS.ID,
          ATTRIBUTE_FIELDS.DISPLAY_NAME,
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
        group: ["Attribute.id"],
        raw: true,
      });

      return res.json({
        success: true,
        message: "Lấy thống kê attributes thành công",
        data: {
          total_attributes: totalAttributes,
          active_attributes: activeAttributes,
          inactive_attributes: inactiveAttributes,
          attributes_usage: attributesWithProducts,
        },
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy thống kê attributes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thống kê thuộc tính.",
      });
    }
  }

  // =========================================================
  // 🔍 ADMIN: TÌM KIẾM ATTRIBUTES THEO TÊN
  // =========================================================
  async searchAttributes(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp từ khóa tìm kiếm.",
        });
      }

      console.log(`🔍 Đang tìm kiếm attributes với từ khóa: ${q}`);

      const attributes = await Attribute.findAll({
        where: {
          [ATTRIBUTE_FIELDS.IS_ACTIVE]: true,
          [Op.or]: [
            { [ATTRIBUTE_FIELDS.NAME]: { [Op.like]: `%${q}%` } },
            { [ATTRIBUTE_FIELDS.DISPLAY_NAME]: { [Op.like]: `%${q}%` } },
          ],
        },
        limit: parseInt(limit),
        order: [[ATTRIBUTE_FIELDS.DISPLAY_NAME, "ASC"]],
      });

      return res.json({
        success: true,
        message: `Tìm thấy ${attributes.length} thuộc tính`,
        data: attributes,
      });
    } catch (error) {
      console.error("❌ Lỗi khi tìm kiếm attributes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tìm kiếm thuộc tính.",
      });
    }
  }
}

export default new AttributeController();

// Xuất hằng số để sử dụng ở nơi khác nếu cần
export { ATTRIBUTE_FIELDS };
