const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const LandingPage = require('../models/LandingPage');
const { upload, cloudinary } = require('../middleware/upload');

// GET all landing pages
router.get('/', async (req, res) => {
  try {
    const pages = await LandingPage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single landing page by slug
router.get('/:slug', async (req, res) => {
  try {
    const rawSlug = req.params.slug;
    let decodedSlug = rawSlug;
    try {
      decodedSlug = decodeURIComponent(rawSlug);
    } catch (e) {}

    const page = await LandingPage.findOne({
      $or: [{ slug: rawSlug }, { slug: decodedSlug }]
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
    }
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create new landing page
router.post('/', upload.single('productImage'), async (req, res) => {
  try {
    const { title, description, whatsappNumber, snapchatPixelId, tiktokPixelId, internalName } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'صورة المنتج مطلوبة' });
    }

    // Generate unique slug
    let baseSlug = slugify(title, { lower: true, strict: true, locale: 'ar' });
    if (!baseSlug) baseSlug = 'page';
    let slug = baseSlug;
    let counter = 1;
    while (await LandingPage.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const page = await LandingPage.create({
      internalName: internalName || '',
      title,
      description,
      productImage: req.file.path,
      productImagePublicId: req.file.filename,
      whatsappNumber,
      snapchatPixelId: snapchatPixelId || '',
      tiktokPixelId: tiktokPixelId || '',
      slug,
    });

    res.status(201).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update landing page
router.put('/:slug', upload.single('productImage'), async (req, res) => {
  try {
    const page = await LandingPage.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
    }

    const { title, description, whatsappNumber, snapchatPixelId, tiktokPixelId, internalName } = req.body;

    // If new image uploaded, delete old one from Cloudinary
    if (req.file) {
      if (page.productImagePublicId) {
        await cloudinary.uploader.destroy(page.productImagePublicId);
      }
      page.productImage = req.file.path;
      page.productImagePublicId = req.file.filename;
    }

    // Update slug if title changed
    if (title && title !== page.title) {
      let baseSlug = slugify(title, { lower: true, strict: true, locale: 'ar' });
      if (!baseSlug) baseSlug = 'page';
      let newSlug = baseSlug;
      let counter = 1;
      while (await LandingPage.findOne({ slug: newSlug, _id: { $ne: page._id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      page.slug = newSlug;
    }

    page.internalName = internalName !== undefined ? internalName : page.internalName;
    page.title = title || page.title;
    page.description = description || page.description;
    page.whatsappNumber = whatsappNumber || page.whatsappNumber;
    page.snapchatPixelId = snapchatPixelId !== undefined ? snapchatPixelId : page.snapchatPixelId;
    page.tiktokPixelId = tiktokPixelId !== undefined ? tiktokPixelId : page.tiktokPixelId;

    await page.save();

    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE landing page
router.delete('/:slug', async (req, res) => {
  try {
    const page = await LandingPage.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
    }

    // Delete image from Cloudinary
    if (page.productImagePublicId) {
      await cloudinary.uploader.destroy(page.productImagePublicId);
    }

    await LandingPage.deleteOne({ slug: req.params.slug });
    res.json({ success: true, message: 'تم حذف الصفحة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
