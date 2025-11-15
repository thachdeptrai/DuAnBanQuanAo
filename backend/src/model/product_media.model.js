// models/product_media.model.js

const ProductMediaModel = (sequelize, DataTypes) => {
  const ProductMedia = sequelize.define(
    "ProductMedia",
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
      variant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: false,
      },
      alt_text: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
      },
      duration: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      thumbnail_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "product_media",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["product_id", "is_primary"], // UNIQUE KEY unq_primary_per_product
          where: {
            is_primary: true, // Chỉ áp dụng unique khi is_primary = true
          },
        },
        {
          fields: ["product_id", "sort_order"], // INDEX idx_product_order
        },
        {
          fields: ["variant_id", "sort_order"], // INDEX idx_variant_media
        },
        {
          fields: ["product_id", "media_type"], // INDEX idx_media_type
        },
      ],
    }
  );

  // Associations
  ProductMedia.associate = function (models) {
    ProductMedia.belongsTo(models.Product, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
    ProductMedia.belongsTo(models.ProductVariant, {
      foreignKey: "variant_id",
      onDelete: "SET NULL",
    });
  };

  return ProductMedia;
};

export default ProductMediaModel;
