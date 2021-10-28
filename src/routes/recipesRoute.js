const express = require('express');
const verifyToken = require('../auth/verifyToken');
const { createRecipe } = require('../controllers/recipesController');

const router = express.Router();

router.post('/', verifyToken, createRecipe);

module.exports = router;
