const Router = require('koa-router')
const router = new Router()
const ensure = require('../assists/ensureAuthenticate')
const { create, replace, update, remove } = require('../controllers/post')
const PostCategory = require('../models/PostCategory')
const Post = require('../models/Post')

router.get('/', async ctx => {
  await ctx.render('posts/all')
})

router.get('/new', ensure,async ctx => {
  let categories = await PostCategory.find({})
  await ctx.render('posts/edit', { user: ctx.state.user, categories: categories })
})

router.get('/:id', async (ctx, next) => {
  try {
    let post = await Post.findById(ctx.params.id).populate('category')
    if (post && (post.public || ctx.isAuthenticated())) {
      await ctx.render('posts/post', { post: post, user: ctx.state.user })
    } else {
      await next()
    }
  } catch (e) {
    if (e.name === 'CastError') { // id is not valid
      await next() // not found
    } else { // render error
      throw e
    }
  }
})

router.get('/:id/edit', ensure,async (ctx, next) => {
  let categories = await PostCategory.find({})
  try {
    let post = await Post.findById(ctx.params.id).populate('category author')
    if (post) {
      await ctx.render('posts/edit', { post: post, categories: categories })
    } else {
      await next()
    }
  } catch (e) {
    if (e.name === 'CastError') { // id is not valid
      await next() // not found
    } else { // render error
      throw e
    }
  }
})

router.post('/', ensure, create)

router.put('/:id', ensure, replace)

router.patch('/:id', ensure, update)

router.delete('/:id', ensure, remove)

module.exports = router