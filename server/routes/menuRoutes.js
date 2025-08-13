// server/routes/menu.js
import express from 'express';
import MenuItem from '../models/Menu.js';
import multer from 'multer';

const router = express.Router();
const textUpload = multer(); 

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate("category", "name");
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error });
  }
});

// Get a single menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate("category", "name");
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item', error });
  }
});

// Create a menu item (supports sizes and ingredients)
// ✅ Add the textUpload.none() middleware here
router.post('/', textUpload.none(), async (req, res) => {
   console.log("Request Body:", req.body);
   let { name, description, price, imageUrl, category, available, jain, sizes, ingredients } = req.body;
  
   try {
     // Correctly parse sizes from JSON string to an array
     const parsedSizes = sizes ? JSON.parse(sizes) : [];
  
     // Correctly convert the ingredients string to an array of strings
     const ingredientsArray = ingredients
       ? ingredients.split(',').map(item => item.trim())
       : [];
  
     // Rest of your validation logic
     if (!price && parsedSizes.length === 0) {
         return res.status(400).json({
             message: 'Name, price or sizes, and category are required'
         });
     }
  
     if (parsedSizes && Array.isArray(parsedSizes)) {
         for (const size of parsedSizes) {
             if (!size.label || typeof size.price !== 'number') {
                 return res.status(400).json({
                     message: 'Each size must have a label and a numeric price'
                 });
             }
         }
     }
  
   const newMenuItem = new MenuItem({
       name,
       description,
       ingredients: ingredientsArray, // Use the new ingredients array
       price: price || 0,
       imageUrl,
       category,
       available,
       jain: jain === 'true' || jain === true, // Parse jain field
       sizes: parsedSizes // Use the parsed sizes array
     });
  
   const savedMenuItem = await newMenuItem.save();
  
   const io = req.app.get('io');
   io.emit('menuCreated', savedMenuItem);
  
   res.status(201).json(savedMenuItem);
   } catch (error) {
     console.error("Error creating menu item:", error); 
     res.status(500).json({ message: 'Error creating menu item', error: error.message });
   }
  });
  
  // The PUT route has the same issue. Fix it as well:
  router.put('/:id', textUpload.none(), async (req, res) => {
    let { name, description, price, imageUrl, category, available, jain, sizes, ingredients } = req.body;

    try {
      // Safely parse sizes from JSON string to an array
      let parsedSizes = [];
      if (sizes && sizes.trim() !== '') {
        try {
          parsedSizes = JSON.parse(sizes);
        } catch (parseError) {
          console.error("Error parsing sizes:", parseError);
          parsedSizes = [];
        }
      }

      // Safely convert the ingredients string to an array of strings
      let ingredientsArray = [];
      if (ingredients && ingredients.trim() !== '') {
        ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(item => item);
      }

      // Validate required fields
      if (!name || !category) {
        return res.status(400).json({
          message: 'Name and category are required'
        });
      }

      // Check if we have either price or sizes
      if (!price && (!parsedSizes || parsedSizes.length === 0)) {
        return res.status(400).json({
          message: 'Either price or at least one size must be provided'
        });
      }

      // Validate sizes if provided
      if (parsedSizes && Array.isArray(parsedSizes)) {
        for (const size of parsedSizes) {
          if (!size.label || typeof size.price !== 'number') {
            return res.status(400).json({
              message: 'Each size must have a label and a numeric price'
            });
          }
        }
      }

      const updateData = {
        name,
        description: description || '',
        price: price ? parseFloat(price) : 0,
        imageUrl: imageUrl || '',
        category,
        available: available === 'true' || available === true,
        jain: jain === 'true' || jain === true, // Parse jain field
        sizes: parsedSizes,
        ingredients: ingredientsArray
      };

      const updatedMenuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      const io = req.app.get('io');
      io.emit('menuUpdated', updatedMenuItem);

      res.status(200).json(updatedMenuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
  });

// The duplicate PUT route is redundant and should be removed.
// Delete a menu item
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
});

export default router;