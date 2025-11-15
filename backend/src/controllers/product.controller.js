import ProductModel from "../model/product.model.js";
import sequelize from "../config/db.js"; // instance Sequelize
import { Op } from "sequelize";

const Product = ProductModel(sequelize, sequelize.DataTypes);

// Lấy tất cả sản phẩm (public)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      products,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm." });
  }
};

// Lấy sản phẩm theo id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm." });
  }
};

// Tạo sản phẩm (admin)
export const createProduct = async (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Chỉ admin mới tạo được sản phẩm." });
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi tạo sản phẩm." });
  }
};

// Cập nhật sản phẩm (admin)
export const updateProduct = async (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Chỉ admin mới cập nhật sản phẩm." });
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm." });
  }
};

// Xóa sản phẩm (admin)
export const deleteProduct = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Chỉ admin mới xóa sản phẩm." });
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });

    await product.destroy();
    res.json({ message: "Xóa sản phẩm thành công." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm." });
  }
};
