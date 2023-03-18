const testingRouter = require('express').Router()
const { Blog } = require('../models/blog')
// const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
  await Blog.destroy()
  // await User.deleteMany({})

  response.status(204).end()
})

testingRouter.put('/:id&lotlikes', async (request, response) => {

  const { likes } = request.body

  const blog = await Blog.findByPk(request.params.id)

  if (blog) {

    blog.likes = likes

    await blog.save()

    response.json(blog)
  } else {
    throw new Error('No entry')
  }

})

module.exports = testingRouter