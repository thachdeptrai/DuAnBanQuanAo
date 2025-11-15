// src/models/otp.model.js

const OTPModel = (sequelize, DataTypes) => {
  const OTPCode = sequelize.define(
    "OtpCode",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("register", "reset_password"),
        defaultValue: "register",
      },
      used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(Date.now() + 5 * 60 * 1000),
      },
    },
    {
      tableName: "otp_codes",
      timestamps: false,
      indexes: [
        { fields: ["email", "type"] },
        { fields: ["expires_at", "used"] },
        { fields: ["created_at"] },
      ],
    }
  );

  return OTPCode;
};

export default OTPModel;
