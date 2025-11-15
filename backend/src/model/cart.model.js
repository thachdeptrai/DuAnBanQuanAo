// models/cart.model.js

const CartModel = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
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
      variant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 1,
        allowNull: false,
      },
      added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "cart",
      timestamps: true,
      createdAt: "added_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "variant_id"], // UNIQUE KEY unq_cart_item
        },
        {
          fields: ["user_id", "added_at"], // INDEX idx_user_added
        },
      ],
    }
  );

  // Associations
  Cart.associate = function (models) {
    Cart.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Cart.belongsTo(models.ProductVariant, {
      foreignKey: "variant_id",
      onDelete: "CASCADE",
    });
  };

  return Cart;
};

export default CartModel;
