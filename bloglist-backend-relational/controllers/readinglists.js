const readingRouter = require('express').Router()
const { Readinglist } = require('../models')
const middleware = require('../utils/middleware')

readingRouter.post(
  '/',
  middleware.verifyToken,
  middleware.userExtractor,
  middleware.sessionCheck,
  async (request, response) => {

    const reading = {
      userId: request.userId,
      blogId: request.body.blogId
    }

    const savedReading = await Readinglist.create(reading)
    response.status(201).json(savedReading)

  }
)

readingRouter.put(
  '/:id',
  middleware.verifyToken,
  middleware.userExtractor,
  middleware.sessionCheck,
  async (request, response) => {

    const user = request.user
    const reading = await Readinglist.findByPk(request.params.id)

    if (reading.userId !== user.id) {
      response.status(403).json({ error: 'attempt to delete another user\'s blog' })
    } else {
      reading.read = request.body.read

      await reading.save()
      response.json(reading)
    }

  }
)

module.exports = readingRouter