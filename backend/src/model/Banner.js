import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    link: { type: String }, // link tới sản phẩm / category / campaign
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 }, // thứ tự hiển thị
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
