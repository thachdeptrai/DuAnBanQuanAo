// models/product_variant.model.js

const ProductVariantModel = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0, // CONSTRAINT chk_variant_price_positive
        },
      },
      compare_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      cost_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      stock_quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        validate: {
          min: 0, // CONSTRAINT chk_stock_non_negative
        },
      },
      low_stock_alert: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "product_variants",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["product_id", "is_active"], // idx_product_active
        },
        {
          fields: ["sku", "stock_quantity"], // idx_sku_stock
        },
        {
          fields: ["price", "stock_quantity"], // idx_price_stock
        },
        {
          fields: ["low_stock_alert", "is_active"], // idx_low_stock
        },
      ],
    }
  );

  // Associations
  ProductVariant.associate = function (models) {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
  };

  return ProductVariant;
};

export default ProductVariantModel;
