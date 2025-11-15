// src/model/orderItem.model.js

// ❌ Dòng import { DataTypes } from "sequelize"; là không cần thiết
//    vì DataTypes phải được truyền qua tham số.

const OrderItemModel = (sequelize, DataTypes) => {
  // ✅ THÊM DataTypes vào tham số
  return sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true, // ✅ SỬA LỖI: Cần là TRUE để cho phép ON DELETE SET NULL
      },
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      variant_sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      variant_attributes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "order_items",
      timestamps: false,
      indexes: [
        {
          name: "idx_order_id",
          fields: ["order_id"],
        },
        {
          name: "idx_variant_id",
          fields: ["variant_id"],
        },
        {
          name: "idx_product_snapshot",
          fields: ["product_name"],
        },
      ],
    }
  );
};

export default OrderItemModel;
