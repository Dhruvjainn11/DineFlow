import express from 'express';
import MenuItem from '../models/Menu.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error });
  }
});

// Get a single menu item by ID
router.get('/:id', async (req, res) =>
    {
   
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu item', error });
    }
}
);

router.post('/' ,async (req, res) => {
  console.log("Received request body:", req.body);
  
  const { name, description, price, imageUrl , category, available } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  try {
    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      imageUrl,
      category,
      available
    });
      const io = req.app.get("io");
      io.emit("menuCreated", newMenuItem); 

    const savedMenuItem = await newMenuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item', error });
  }
});

router.put('/:id', async (req, res) => {
    const { name, description, price, imageUrl, category, available } = req.body;
    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    try {
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { name, description, price, imageUrl, category, available },
            { new: true }
        );
        if (!updatedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        const io = req.app.get("io");
        io.emit("menuUpdated", updatedMenuItem); 
        res.status(200).json(updatedMenuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
}
);

router.delete('/:id', async (req, res) => {
    try {
        const deletedMenuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        const io = req.app.get("io");
        io.emit("menuDeleted", deletedMenuItem._id);

        res.status(200).json({ message: 'Menu item deleted successfully' });
        } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
}
);


export default router;