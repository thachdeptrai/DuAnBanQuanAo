// models/wishlist.model.js

const WishlistModel = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "wishlist",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "product_id", "variant_id"], // UNIQUE KEY unq_wishlist
        },
        {
          fields: ["user_id", "product_id"], // INDEX idx_user_product
        },
        {
          fields: ["added_at"], // INDEX idx_added_at
        },
      ],
    }
  );

  // Associations
  Wishlist.associate = function (models) {
    Wishlist.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Wishlist.belongsTo(models.Product, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
    });
    Wishlist.belongsTo(models.ProductVariant, {
      foreignKey: "variant_id",
      onDelete: "CASCADE",
    });
  };

  return Wishlist;
};

export default WishlistModel;
