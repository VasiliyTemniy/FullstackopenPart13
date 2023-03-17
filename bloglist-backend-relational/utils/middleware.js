const logger = require('./logger')
const jwt = require('jsonwebtoken')
const config = require('./config')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }
  next(error)
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
  const user = await User.findById(request.userId)
  request.user = user
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  verifyToken,
  userExtractor
}
