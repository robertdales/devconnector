const express = require('express');

const router = express.Router();

//@route  GET api/posts
//@desc   Test route
//@access Pubic
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;
