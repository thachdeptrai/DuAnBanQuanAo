// src/models/associations.js

export const setupAssociations = (models) => {
  const {
    User,
    Product,
    ProductVariant,
    ProductMedia,
    Category,
    Brand,
    Attribute,
    AttributeValue,
    VariantAttribute,
    Cart,
    Wishlist,
    Order,
    OrderItem,
    Coupon,
    OTPCode,
  } = models;

  console.log("🔗 Setting up associations...");

  // ================= USER =================
  User.hasMany(Cart, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(Wishlist, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(Order, { foreignKey: "user_id", onDelete: "CASCADE" });

  User.hasMany(OTPCode, {
    foreignKey: "email",
    sourceKey: "email",
    constraints: false,
  });

  // ================= CATEGORY =================
  Category.belongsTo(Category, {
    as: "parent",
    foreignKey: "parent_id",
    onDelete: "SET NULL",
  });

  Category.hasMany(Category, {
    as: "children",
    foreignKey: "parent_id",
  });

  Category.hasMany(Product, {
    foreignKey: "category_id",
    onDelete: "SET NULL",
  });

  // ================= BRAND =================
  Brand.hasMany(Product, {
    foreignKey: "brand_id",
    onDelete: "SET NULL",
  });

  // ================= PRODUCT =================
  Product.belongsTo(Category, { foreignKey: "category_id" });
  Product.belongsTo(Brand, { foreignKey: "brand_id" });

  Product.hasMany(ProductVariant, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  Product.hasMany(ProductMedia, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  Product.hasMany(Wishlist, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  // ================= PRODUCT VARIANT =================
  ProductVariant.belongsTo(Product, { foreignKey: "product_id" });

  ProductVariant.hasMany(ProductMedia, {
    foreignKey: "variant_id",
    onDelete: "SET NULL",
  });

  ProductVariant.hasMany(Cart, {
    foreignKey: "variant_id",
    onDelete: "CASCADE",
  });

  ProductVariant.hasMany(Wishlist, {
    foreignKey: "variant_id",
    onDelete: "CASCADE",
  });

  ProductVariant.hasMany(OrderItem, {
    foreignKey: "variant_id",
    onDelete: "SET NULL",
  });

  ProductVariant.hasMany(VariantAttribute, {
    foreignKey: "variant_id",
    onDelete: "CASCADE",
  });

  // ================= ATTRIBUTES =================
  Attribute.hasMany(AttributeValue, {
    foreignKey: "attribute_id",
    onDelete: "CASCADE",
  });

  Attribute.hasMany(VariantAttribute, {
    foreignKey: "attribute_id",
  });

  AttributeValue.belongsTo(Attribute, {
    foreignKey: "attribute_id",
  });

  AttributeValue.hasMany(VariantAttribute, {
    foreignKey: "attribute_value_id",
  });

  VariantAttribute.belongsTo(ProductVariant, {
    foreignKey: "variant_id",
  });

  VariantAttribute.belongsTo(Attribute, {
    foreignKey: "attribute_id",
  });

  VariantAttribute.belongsTo(AttributeValue, {
    foreignKey: "attribute_value_id",
  });

  // ================= MEDIA =================
  ProductMedia.belongsTo(Product, { foreignKey: "product_id" });

  ProductMedia.belongsTo(ProductVariant, {
    foreignKey: "variant_id",
    onDelete: "SET NULL",
  });

  // ================= CART =================
  Cart.belongsTo(User, { foreignKey: "user_id" });

  Cart.belongsTo(ProductVariant, { foreignKey: "variant_id" });

  // ================= WISHLIST =================
  Wishlist.belongsTo(User, { foreignKey: "user_id" });

  Wishlist.belongsTo(Product, { foreignKey: "product_id" });

  Wishlist.belongsTo(ProductVariant, {
    foreignKey: "variant_id",
    onDelete: "SET NULL",
  });

  // ================= ORDER =================
  Order.belongsTo(User, { foreignKey: "user_id" });

  Order.belongsTo(Coupon, { foreignKey: "coupon_id", onDelete: "SET NULL" });

  Order.hasMany(OrderItem, {
    foreignKey: "order_id",
    as: "items",
    onDelete: "CASCADE",
  });

  // ================= ORDER ITEM =================
  OrderItem.belongsTo(Order, { foreignKey: "order_id" });

  OrderItem.belongsTo(ProductVariant, {
    foreignKey: "variant_id",
    onDelete: "SET NULL",
  });

  // ================= COUPON =================
  Coupon.hasMany(Order, { foreignKey: "coupon_id" });

  console.log("✅ Associations completed!");
};
