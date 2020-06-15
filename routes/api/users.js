const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// Import User model

const User = require('../../models/User');

//@route  POST api/users
//@desc   Register user
//@access Pubic
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure req.body to get name, email and password
    const { name, email, password } = req.body;

    try {
      // Check if user exists, error if so
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get gravatar
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mp' });

      // Create user object. Note: not written to DB until password is hashed
      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password with BCrypt. 10 is number of salt rounds. Use await because can take time to calc.
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //Write user to DB
      await user.save();

      // return jsonwebtoken
      const payload = { user: { id: user.id } };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
