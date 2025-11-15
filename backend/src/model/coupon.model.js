// models/coupon.model.js

const CouponModel = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      discount_type: {
        type: DataTypes.ENUM("percentage", "fixed_amount"),
        allowNull: false,
      },
      discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      min_order_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      max_discount_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      applies_to: {
        type: DataTypes.ENUM(
          "all_products",
          "specific_products",
          "specific_categories",
          "first_order"
        ),
        defaultValue: "all_products",
      },
      usage_limit: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      used_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      per_user_limit: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 1,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: "coupons",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["code", "is_active"], // INDEX idx_code_active
        },
        {
          fields: ["start_date", "end_date", "is_active"], // INDEX idx_dates_active
        },
        {
          fields: ["usage_limit", "used_count"], // INDEX idx_usage
        },
      ],
    }
  );

  return Coupon;
};

export default CouponModel;
