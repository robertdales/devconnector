const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// Import required DB Schemas
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  GET api/profile/me
//@desc   Get current user's profile
//@access Private

router.get('/me', auth, async (req, res) => {
  try {
    // Create profile from matching user id. Use fields from user to populate it
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.jsn(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  POST api/profile
//@desc   Create or update a user profile
//@access Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure req.body into fields
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object. Check values have been set before including them in the object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // skills is an array, so convert comma-separated string into array with split. Use map to trim spaces from each skill
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build social object. Create empty object to start with
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // Write the data
    try {
      // Find a profile
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // if exists, update it. Use $set
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // Send back json object of profile
        return res.json(profile);
      }
      // If profile doesn't exist then we need to create it
      profile = new Profile(profileFields);

      // Write to DB
      await profile.save();

      // Return created profile
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@route  GET api/profile
//@desc   Get all profiles
//@access Public

router.get('/', async (req, res) => {
  try {
    //Find all profiles
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  GET api/profile/user/:user_id
//@desc   Get profile by user ID
//@access Public

router.get('/user/:user_id', async (req, res) => {
  try {
    //Find profile matching user ID. Use params passed via URL
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    // Send error if no profile
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    // Respond appropriately to an invalid profile request (not the same as a missing profile, but the error is the same)
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route  DELETE api/profile
//@desc   Delete profile, user and posts
//@access Private

router.delete('/', auth, async (req, res) => {
  try {
    //@ TO DO - REMOVE USERS POSTS

    // Find profile by user id and remove it
    await Profile.findOneAndRemove({ user: req.user.id });

    // Find user by id and remove
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  PUT api/profile/experience
//@desc   Add experience to profile
//@access Private

//User a put request because we are only updating one specific part of the data
//READ MORE ON 'PUT'
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure req.body into fields
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    // Create new experience object from fields
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    console.log(newExp);
    try {
      // Get the profile we're adding the experience to
      const profile = await Profile.findOne({ user: req.user.id });

      // Add the new experience to the profile. Unshift is like push(), but pushes to beginning of array, not end
      profile.experience.unshift(newExp);

      // Write it to DB
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@route  DELETE api/profile/experience/:exp_id
//@desc   Delete experience from profile
//@access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    //  Get the correct profile from which to remove the experience
    const profile = await Profile.findOne({ user: req.user.id });

    // Get Remove Index, matching the exp_id
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    // Use it to remove that item from the array
    profile.experience.splice(removeIndex, 1);

    // Write it back to DB
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error in DELETE experience');
  }
});

//@route  PUT api/profile/education
//@desc   Add education to profile
//@access Private

//User a put request because we are only updating one specific part of the data
//READ MORE ON 'PUT'
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldOfStudy', 'Field of Study is required'),
      check('from', 'From date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure req.body into fields
    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    } = req.body;

    // Create new education object from fields
    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    };
    console.log(newEdu);
    try {
      // Get the profile we're adding the education to
      const profile = await Profile.findOne({ user: req.user.id });

      // Add the new education to the profile. Unshift is like push(), but pushes to beginning of array, not end
      profile.education.unshift(newEdu);

      // Write it to DB
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@route  DELETE api/profile/education/:edu_id
//@desc   Delete education from profile
//@access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    //  Get the correct profile from which to remove the education
    const profile = await Profile.findOne({ user: req.user.id });

    // Get Remove Index, matching the ed_id
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // Use it to remove that item from the array
    profile.education.splice(removeIndex, 1);

    // Write it back to DB
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error in DELETE education');
  }
});

//@route  GET api/profile/github/:username
//@desc   Get user repos from github
//@access Public

router.get('/github/:username', (req, res) => {
  try {
    // Create options object for github API query
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=create:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    // Use the options to make the request
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'Github user not found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
