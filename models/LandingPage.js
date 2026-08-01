const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'العنوان مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'الوصف مطلوب'],
      trim: true,
    },
    productImage: {
      type: String,
      required: [true, 'صورة المنتج مطلوبة'],
    },
    productImagePublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    whatsappNumber: {
      type: String,
      required: [true, 'رقم الواتساب مطلوب'],
      trim: true,
    },
    snapchatPixelId: {
      type: String,
      trim: true,
      default: '',
    },
    tiktokPixelId: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LandingPage', landingPageSchema);
