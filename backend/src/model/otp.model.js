// src/model/otp.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OTPCode = sequelize.define(
  "otp_codes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "otp_codes",
  }
);

export default OTPCode;
