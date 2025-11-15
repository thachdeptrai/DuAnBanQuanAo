// models/order.model.js

const OrderModel = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      customer_email: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      subtotal_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      coupon_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      coupon_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      coupon_discount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded"
        ),
        defaultValue: "pending",
      },
      payment_method: {
        type: DataTypes.ENUM(
          "cod",
          "bank_transfer",
          "credit_card",
          "momo",
          "zalopay"
        ),
        defaultValue: "cod",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
      shipping_method: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      tracking_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      estimated_delivery: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      customer_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      admin_note: {
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
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      shipped_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["order_number"], // INDEX idx_order_number
        },
        {
          fields: ["user_id", "status"], // INDEX idx_user_status
        },
        {
          fields: ["created_at", "status"], // INDEX idx_created_status
        },
        {
          fields: ["payment_status"], // INDEX idx_payment_status
        },
        {
          fields: ["tracking_number"], // INDEX idx_tracking
        },
        {
          fields: ["status", "payment_status", "created_at"], // INDEX idx_status_payment
        },
        {
          fields: ["user_id", "created_at"], // INDEX idx_user_created
        },
      ],
    }
  );

  // Associations
  Order.associate = function (models) {
    Order.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Order.belongsTo(models.Coupon, {
      foreignKey: "coupon_id",
      onDelete: "SET NULL",
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: "order_id",
      as: "items",
    });
  };

  return Order;
};

export default OrderModel;
