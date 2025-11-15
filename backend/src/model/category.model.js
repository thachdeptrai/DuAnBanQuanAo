// models/category.model.js

const CategoryModel = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      parent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      meta_title: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.STRING(255),
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
      tableName: "categories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["slug"],
        },
        {
          fields: ["parent_id", "is_active"], // idx_parent_active
        },
        {
          fields: ["sort_order", "is_active"], // idx_sort_active
        },
      ],
    }
  );

  // Self-referential association for parent-child relationship
  Category.associate = function (models) {
    Category.belongsTo(Category, {
      as: "parent",
      foreignKey: "parent_id",
      onDelete: "SET NULL",
    });
    Category.hasMany(Category, {
      as: "children",
      foreignKey: "parent_id",
    });
  };

  return Category;
};

export default CategoryModel;
