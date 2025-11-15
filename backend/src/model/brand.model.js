// src/model/brand.model.js
import { DataTypes } from "sequelize";

const BrandModel = (sequelize) => {
  return sequelize.define(
    "Brand",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true, // ✅ Thêm unique constraint
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      website_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "brands",
      timestamps: false,
      indexes: [
        {
          name: "idx_slug_active",
          fields: ["slug", "is_active"], // ✅ Composite index cho slug và is_active
        },
        {
          name: "idx_sort_active",
          fields: ["sort_order", "is_active"], // ✅ Composite index cho sort_order và is_active
        },
      ],
      hooks: {
        beforeUpdate: (brand) => {
          brand.updated_at = new Date(); // ✅ Tự động cập nhật updated_at
        },
      },
    }
  );
};

export default BrandModel;
