// src/model/init.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { setupAssociations } from "./associations.js";

// Import model factory functions
import UserModel from "./user.model.js";
import ProductModel from "./product.model.js";
import ProductVariantModel from "./product_variant.model.js";
import ProductMediaModel from "./product_media.model.js";
import CategoryModel from "./category.model.js";
import BrandModel from "./brand.model.js";
import AttributeModel from "./attributes.model.js";
import AttributeValueModel from "./attribute_values.model.js";
import VariantAttributeModel from "./variant_attributes.model.js";
import CartModel from "./cart.model.js";
import WishlistModel from "./Wishlist.js";
import OrderModel from "./order.model.js";
import OrderItemModel from "./order_item.model.js";
import CouponModel from "./coupon.model.js";
import OTPCodeModel from "./otp.model.js";

console.log("🛠️  Loading models...");

// Khởi tạo Models
const models = {
  User: UserModel(sequelize, DataTypes),
  Product: ProductModel(sequelize, DataTypes),
  ProductVariant: ProductVariantModel(sequelize, DataTypes),
  ProductMedia: ProductMediaModel(sequelize, DataTypes),
  Category: CategoryModel(sequelize, DataTypes),
  Brand: BrandModel(sequelize, DataTypes),
  Attribute: AttributeModel(sequelize, DataTypes),
  AttributeValue: AttributeValueModel(sequelize, DataTypes),
  VariantAttribute: VariantAttributeModel(sequelize, DataTypes),
  Cart: CartModel(sequelize, DataTypes),
  Wishlist: WishlistModel(sequelize, DataTypes),
  Order: OrderModel(sequelize, DataTypes),
  OrderItem: OrderItemModel(sequelize, DataTypes),
  Coupon: CouponModel(sequelize, DataTypes),
  OTPCode: OTPCodeModel(sequelize, DataTypes),
};

// Thiết lập quan hệ
setupAssociations(models);

console.log("✅ All models loaded: ", Object.keys(models).join(", "));

export default models;
