// src/model/product.model.js
import { DataTypes } from "sequelize";

const ProductModel = (sequelize) => {
  return sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      short_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      cost_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      sku_prefix: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      brand_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_new: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      average_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      total_reviews: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      total_sales: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      min_price: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
      max_price: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
      meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "products",
      timestamps: false,
      indexes: [
        {
          name: "idx_category_active",
          fields: ["category_id", "is_active"],
        },
        {
          name: "idx_brand_active",
          fields: ["brand_id", "is_active"],
        },
        {
          name: "idx_featured_active",
          fields: ["is_featured", "is_active"],
        },
        {
          name: "idx_price_range",
          fields: ["min_price", "max_price"],
        },
        {
          name: "idx_created_active",
          fields: ["created_at", "is_active"],
        },
      ],
    }
  );
};

export default ProductModel;
