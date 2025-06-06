// server/routes/categoryRoutes.js
import express from 'express';
import Category from '../models/Category.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST create new category
router.post('/',protect, allowRoles('admin'), async (req, res) => {
  try {
    const { name } = req.body;

    const newCategory = new Category({ name });
    const savedCategory = await newCategory.save();

    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT update category by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
