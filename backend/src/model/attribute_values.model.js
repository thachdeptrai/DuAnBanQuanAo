// models/attribute_value.model.js

const AttributeValueModel = (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define(
    "AttributeValue",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      attribute_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      display_value: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      color_hex: {
        type: DataTypes.STRING(7),
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.TINYINT.UNSIGNED,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "attribute_values",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["attribute_id", "value"], // UNIQUE KEY unq_attribute_value
        },
        {
          fields: ["attribute_id", "is_active", "sort_order"], // INDEX idx_attribute_active
        },
      ],
    }
  );

  // Associations
  AttributeValue.associate = function (models) {
    AttributeValue.belongsTo(models.Attribute, {
      foreignKey: "attribute_id",
      onDelete: "CASCADE",
    });
  };

  return AttributeValue;
};

export default AttributeValueModel;
