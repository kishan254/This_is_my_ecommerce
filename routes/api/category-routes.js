const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// Get all categories
router.get('/', async (req, res) => {
  try {
    // Creating a variable to hold the results from finding all categories
    const categoryData = await Category.findAll({
      include: [
        // Including the products that belong to the categories
        { 
          model: Product,
        },
      ],
    });
    // If no category data, send 404 and message.
    if (!categoryData) {
      res.status(404).json({ message: 'No categories found!'});
      return;
    }
    // Success! return category data in json format
    res.status(200).json(categoryData);
  } catch (err) {
    // Server side error
    res.status(500).json(err);
  }
});

// Get a category by a specific id
router.get('/:id', async (req, res) => {
  try {
    // Creating a variable to hold the response from the method find by a primary key.
    const categoryData = await Category.findByPk(req.params.id, {
      // Use the users request to find the id associated in the array of objects, include the products associated to the category.
      include: [
        {
          model: Product,
        }
      ],
    });
    // If no data found matching the id, return 404 and message.
    if (!categoryData) {
      res.status(404).json({ message: 'No category found by that id!' });
      return;
    }
    // Success! Return 200 status and category data in json format.
    res.status(200).json(categoryData);
  } catch (err) {
    // Server error.
    res.status(500).json(err);
  }
});

// Create a new category.
router.post('/', async (req, res) => {
  try {
    // Create a variable to hold the response, place the user request inside the methods parameters.
    const categoryData = await Category.create(req.body);
    // Success! Return status 200 and category data into the categories array.
    res.status(200).json(categoryData);
  } catch (err) {
    // Server error.
    res.status(500).json(err);
  }
});

// Update a category.
router.put('/:id', async (req, res) => {
  try {
    // Create a variable to hold response, update the category where the id matches.
    const categoryData = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    // If no matching id, return 404 and message.
    if (!categoryData) {
      res.status(404).json({ message: 'There is no category matching that id!' });
      return;
    }
    // Success, update category array of objects with input from user.
    res.status(200).json(categoryData);
  } catch {
    // Server error.
    res.status(500).json(err);
  }
});

// Delete category.
router.delete('/:id', async (req, res) => {
  try {
    // Delete products that are assigned the matching category id.
    Product.destroy({
      where: {
        category_id: req.params.id,
      },
    }).then
    // Then create variable for the destroyed category where the id matches the user's requested.
    const categoryData = await Category.destroy({
      where: {
          id: req.params.id,
        },
    })
    // If no matching category id, return 404 and message
    if (!categoryData) {
      res.status(404).json({ message: 'No category found by that id!' });
      return;
    }
    // Success! Return status 200 and category new category data in json format.
    res.status(200).json(categoryData);
  } catch (err) {
    // Server error.
    res.status(500).json(err);
  }
});

module.exports = router;