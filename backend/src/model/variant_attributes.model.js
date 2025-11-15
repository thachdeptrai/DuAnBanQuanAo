// models/variant_attribute.model.js

const VariantAttributeModel = (sequelize, DataTypes) => {
  const VariantAttribute = sequelize.define(
    "VariantAttribute",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      variant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      attribute_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      attribute_value_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "variant_attributes",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["variant_id", "attribute_id"], // UNIQUE KEY unq_variant_attribute
        },
        {
          fields: ["variant_id"], // INDEX idx_variant_id
        },
        {
          fields: ["attribute_id", "attribute_value_id"], // INDEX idx_attribute_combo
        },
      ],
    }
  );

  // Associations
  VariantAttribute.associate = function (models) {
    VariantAttribute.belongsTo(models.ProductVariant, {
      foreignKey: "variant_id",
      onDelete: "CASCADE",
    });
    VariantAttribute.belongsTo(models.Attribute, {
      foreignKey: "attribute_id",
    });
    VariantAttribute.belongsTo(models.AttributeValue, {
      foreignKey: "attribute_value_id",
    });
  };

  return VariantAttribute;
};

export default VariantAttributeModel;
