const blogsRouter = require('express').Router()
const { Blog } = require('../models')
const { User } = require('../models')
const middleware = require('../utils/middleware')
const { Op } = require('sequelize')

blogsRouter.post(
  '/',
  middleware.verifyToken,
  middleware.userExtractor,
  async (request, response) => {
    const body = request.body

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: 0,
      userId: request.userId,
      // comments: [],
    }

    const savedBlog = await Blog.create(blog)
    response.status(201).json(savedBlog)
  },
)

blogsRouter.get('/', async (request, response) => {

  const where = {}

  if (request.query.search) {
    where.title = {
      [Op.substring]: request.query.search
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where
  })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findByPk(request.params.id, {
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    }
  })

  if (blog) {
    response.json(blog)
  } else {
    throw new Error('No blog entry')
  }
})

blogsRouter.delete(
  '/:id',
  middleware.verifyToken,
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user
    const blog = await Blog.findByPk(request.params.id)

    if (!blog) {
      throw new Error('No blog entry')
    }

    if (user.id !== blog.userId) {
      response.status(403).json({ error: 'attempt to delete another user\'s blog' })
    } else {
      await Blog.destroy({
        where: {
          id: request.params.id
        }
      })
  
      response.status(204).end()
    }
  },
)

blogsRouter.put(
  '/:id&like',
  middleware.verifyToken,
  middleware.userExtractor,
  async (request, response) => {

    const user = request.user

    const wasLiked = user.likedBlogs.indexOf(Number(request.params.id)) === -1 ? false : true

    if (wasLiked) {
      return response.status(403).json({ error: 'attempt to like a blog twice' })
    } else {

      const blog = await Blog.findByPk(request.params.id)

      if (blog) {

        blog.likes = blog.likes + 1
        await blog.save()
  
        user.likedBlogs = request.user.likedBlogs.concat(blog.id)
        await user.save()
  
        response.json(blog)
      } else {
        throw new Error('No blog entry')
      }
    }

  },
)

// blogsRouter.put(
//   '/:id&comment',
//   middleware.verifyToken,
//   middleware.userExtractor,
//   async (request, response) => {

//     const blog = await Blog.findById(request.params.id, 'comments').exec()
//     const updatedBlog = await Blog.findByIdAndUpdate(
//       request.params.id,
//       { comments: blog.comments.concat(request.body.comment) },
//       { new: true, runValidators: true, context: 'query' },
//     )

//     response.json(updatedBlog)
//   },
// )

blogsRouter.put(
  '/:id',
  middleware.verifyToken,
  middleware.userExtractor,
  async (request, response) => {
    const { title, author, url } = request.body
    const user = request.user

    const blog = await Blog.findByPk(request.params.id)

    if (blog) {

      if (user.id !== blog.userId) {
        response.status(403).json({ error: 'attempt to update another user\'s blog' })
      }

      blog.title = title
      blog.author = author
      blog.url = url

      await blog.save()

      response.json(blog)
    } else {
      throw new Error('No blog entry')
    }
  },
)

module.exports = blogsRouter