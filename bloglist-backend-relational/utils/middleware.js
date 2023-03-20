const logger = require('./logger')
const jwt = require('jsonwebtoken')
const config = require('./config')
const { User, Session } = require('../models')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const verifyToken = (request, response, next) => {
  const authorization = request.get('authorization')
  const token =
    authorization && authorization.toLowerCase().startsWith('bearer ')
      ? authorization.substring(7)
      : null

  if (!request.headers.authorization) {
    return response.status(401).json({ error: 'Authorization required' })
  }
  if (token === 'null') {
    return response.status(401).json({ error: 'token missing' })
  }
  const payload = jwt.verify(token, config.SECRET)
  if (!payload) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  request.userId = payload.id
  request.token = token
  next()
}

const userExtractor = async (request, response, next) => {
  const user = await User.findByPk(request.userId)
  request.user = user
  next()
}

const sessionCheck = async (request, response, next) => {
  const session = await Session.findOne({
    where: {
      userId: request.userId,
      token: request.token
    }
  })

  if (!session) {
    return response.status(401).json({ error: 'Inactive session. Please, login' })
  }

  next()
}

const errorHandler = async (error, request, response, next) => {

  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    await Session.destroy({
      where: {
        userId: request.userId,
        token: request.token
      }
    })
    return response.status(401).json({ error: 'token expired' })
  } else if (error.name === 'SequelizeValidationError') {
    if (error.message === 'Validation error: Validation isEmail on username failed') {
      return response.status(400).json({ error: 'Validation isEmail on username failed' })
    } else if (error.message === 'notNull Violation: blog.year cannot be null') {
      return response.status(400).json({ error: 'Specify blog creation year' })
    } else if (error.message === 'Validation error: Validation min on year failed' || error.message === 'Validation error: Validation max on year failed') {
      return response.status(400).json({ error: 'Invalid year' })
    } else {
      return response.status(400).json({ error: 'Validation error' })
    }
  } else if (error.message === 'No blog entry') {
    return response.status(404).send({ error: 'Invalid blog id' })
  } else if (error.message === 'No user entry') {
    return response.status(404).send({ error: 'Invalid user id' })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
  requestLogger,
  verifyToken,
  userExtractor,
  sessionCheck,
  errorHandler,
  unknownEndpoint
}
