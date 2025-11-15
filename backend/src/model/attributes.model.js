// models/attribute.model.js

const AttributeModel = (sequelize, DataTypes) => {
  const Attribute = sequelize.define(
    "Attribute",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
      tableName: "attributes",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["name"], // UNIQUE KEY unq_name
        },
        {
          fields: ["is_active", "sort_order"], // INDEX idx_active_sort
        },
      ],
    }
  );

  return Attribute;
};

export default AttributeModel;
