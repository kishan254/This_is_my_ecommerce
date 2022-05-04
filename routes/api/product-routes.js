const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // Using findAll to recieve all products.
    const productData = await Product.findAll({
      include: [
        // Including the Category table, specifically the id and category_name.
        {
          model: Category,
          attributes: ['id', 'category_name'],
        },
        // Including the Tag table, specifically the id and tag_name
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
        },
      ],
    })
    // If no data in the database, send the message.
    if (!productData) {
      res.status(404).json({ message: 'No products found!' });
      return;
    }
    // Success! Respond with product data in json format.
    res.status(200).json(productData);
  } catch (err) {
    // Server side error, respond with error
    res.status(500).json(err);
  };
});

// Get one product by id
router.get('/:id', async (req, res) => {
  try {
    // Finding one product where the id is equal to the users request
    const productData = await Product.findByPk(req.params.id, {
      include: [
        // Including both Tag and Category associated through the relationship declared on the models. Selecting specific attributes to use.
        {
          model: Category,
          attributes: ['id', 'category_name'],
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name']
        },
      ],
    })
    // If no product id matches the request, return status and message
    if (!productData) {
      res.status(404).json({ message: 'No product found by that id!' });
      return;
    }
    // Success! Return productData formatted in json.
    res.status(200).json(productData);
  } catch (err){
    // Server side error.
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    // Create the product data that will hold the response if succesful. Usikng the destroy method in order to delete.
    const productData = await Product.destroy({
      // Selecting to delete where the id matches the user's requested id
      where: {
        id: req.params.id,
      },
    });
    // If no id matches, respond with 404 status and message.
    if (!productData) {
      res.status(404).json({ message: 'Could not find any product with that id!'});
      return;
    }
    // Success! Respond with productData formatted in json
    res.status(200).json(productData);
  } catch (err) {
    // If server error, respond with the error.
    res.status(500).json(err);
  }
});

module.exports = router;