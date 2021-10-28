const express = require('express');
const verifyToken = require('../auth/verifyToken');
const { createRecipe, getAllRecipes } = require('../controllers/recipesController');

const router = express.Router();

router.post('/', verifyToken, createRecipe);
router.get('/', getAllRecipes);

module.exports = router;
