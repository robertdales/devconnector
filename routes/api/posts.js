const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  POST api/posts
//@desc   Create a post
//@access Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // get current user
      const user = await User.findById(req.user.id).select('-password');

      // Create new post object, pulling in some fields from user record
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      // Save it to DB as post
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//@route  GET api/posts
//@desc   Get all posts
//@access Private

router.get('/', auth, async (req, res) => {
  try {
    // Find all posts, sort by descending date
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  GET api/posts/:id
//@desc   Get post by id
//@access Private

router.get('/:id', auth, async (req, res) => {
  try {
    // Find post by Id
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route  DELETE api/posts/:id
//@desc   Delete a post
//@access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    // Find post by Id
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user who created post matches post to be deleted
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User not authorised to delete post' });
    }
    // Remove the post
    await post.remove();
    return res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

//@route  PUT api/posts/like/:id
//@desc   Like a post
//@access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    //Find the post
    const post = await Post.findById(req.params.id);

    //Check if post has already been liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    // Add like to post likes
    post.likes.unshift({ user: req.user.id });
    // write to db
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  PUT api/posts/unlike/:id
//@desc   Like a post
//@access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    //Find the post
    const post = await Post.findById(req.params.id);

    //Check if post has already been liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    // Remove from likes array using splice
    post.likes.splice(removeIndex, 1);

    // write to db
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//@route  POST api/posts/comment/:id
//@desc   Comment on a post
//@access Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // get current user
      const user = await User.findById(req.user.id).select('-password');
      //Get post matching id from params
      const post = await Post.findById(req.params.id);

      // Create new comment object, pulling in some fields from user record
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      //Add to front of comments
      post.comments.unshift(newComment);

      // Save it to DB as post
      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error in comment post');
    }
  }
);

//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   Delete a comment
//@access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    //Get post matching id from params
    const post = await Post.findById(req.params.id);
    // Pull out comment from post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user made the comment they are trying to delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User unauthorised' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    // Remove from comments array using splice
    post.comments.splice(removeIndex, 1);

    // write to db
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error in comment delete');
  }
});

module.exports = router;
