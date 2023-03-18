const blogsRouter = require('express').Router()
const { Blog } = require('../models')
const { User } = require('../models')
const middleware = require('../utils/middleware')

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
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    }
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
    let user = request.user
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

    // const wasLiked = request.user.likedBlogs.indexOf(request.params.id) === -1 ? false : true
    // if (wasLiked) {
    //   return response.status(403).json({ error: "attempt to like a blog twice" })
    // } else {
    //   const blog = await Blog.findById(request.params.id, 'likes').exec()
    //   const updatedBlog = await Blog.findByIdAndUpdate(
    //     request.params.id,
    //     { likes: blog.likes +1 },
    //     { new: true, runValidators: true, context: 'query' },
    //   )

    //   request.user.likedBlogs = request.user.likedBlogs.concat(updatedBlog._id)
    //   await request.user.save()

    //   response.json(updatedBlog)
    // }

    const blog = await Blog.findByPk(request.params.id)

    if (blog) {

      blog.likes = blog.likes + 1

      await blog.save()

      response.json(blog)
    } else {
      throw new Error('No blog entry')
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
  // middleware.verifyToken,
  // middleware.userExtractor,
  async (request, response) => {
    const { title, author, url } = request.body
    // const indexToUpdate = request.user.blogs.indexOf(request.params.id)

    // if (indexToUpdate === -1) {
    //   return response.status(403).json({ error: "attempt to update another user's blog" })
    // } else {
    //   const blog = await Blog.findById(request.params.id, 'comments').exec()
    //   const updatedBlog = await Blog.findByIdAndUpdate(
    //     request.params.id,
    //     { title, author, url, likes: blog.likes, user: blog.user, comments: blog.comments },
    //     { new: true, runValidators: true, context: 'query' },
    //   )

    //   response.json(updatedBlog)
    // }


    const blog = await Blog.findByPk(request.params.id)

    if (blog) {

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