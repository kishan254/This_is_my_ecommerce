const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// Get all Tags.
router.get('/', async (req, res) => {
  try {
    // Creating a variable to hold the results from finding all tags
    const tagData = await Tag.findAll({
      include: [
        // Including the products that belong to the Tag
        {
          model: Product
        },
      ],
    })
    if (!tagData) {
      // If no tag data, send 404 and message.
      res.status(404).json({ message: 'No tags found!' });
      return;
    }
    // Success! return tag data in json format
    res.status(200).json(tagData);
  } catch (err) {
    // Server side error
    res.status(500).json(err);
  }
});

// Get a tag by a specific id
router.get('/:id', async (req, res) => {
  try {
    // Createa variable to hold the response, find the response by a specific primary key provided by the user and matched with the db
    const tagData = await Tag.findByPk(req.params.id, {
      include: [
        // Include the tag's products
        {
          model: Product,
        },
      ],
    })
    // If no data matches the id, return message and 404 status.
    if (!tagData) {
      res.status(404).json({ message: 'No tags found by that id!' });
      return;
    }
    // Success! Return the response and 200 status.
    res.status(200).json(tagData);
  } catch (err) {
    // Server side error
    res.status(500).json(err);
  }
});

// Create a new tag
router.post('/', async (req, res) => {
  try {
    // Create a variable that will hold the response of creating a new tag
    const tagData = await Tag.create(req.body);
    // Success! New tag created.
    res.status(200).json(tagData);
  } catch (err) { 
    // Server side error
    res.status(500).json(err)
  }
});

// Update a tag
router.put('/:id', async (req, res) => {
  try {
    // Updating the body the array where the objects id matches the requested
    const tagData = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
    // The id requested does not match any id in the database.
    if (!tagData) {
      res.status(404).json({ message: 'No tag found by that id!' });
      return;
    }
    // Success! 
    res.status(200).json(tagData);
  } catch (err) {
    // Server side error
    res.status(500).json(err);
  }
});

// Delete a specific id.
router.delete('/:id', async (req, res) => {
  try {
    // Create variable to delete the id requested by the user
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    })
    // If id doesnt match any data, return the 404 and message
    if (!tagData) {
      res.status(404).json({ message: 'No tag found by that id!' });
      return;
    }
    // Success!
    res.status(200).json(tagData);
  } catch (err) {
    // Server side error
    res.status(500).json(err);
  }
});

module.exports = router;