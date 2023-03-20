const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const loginRouter = require('express').Router()
const { User, Session } = require('../models')
const middleware = require('../utils/middleware')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.scope('all').findOne({
    where: {username: username}
  })
  const passwordCorrect =
    user === null ? false : await bcryptjs.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  } else if (user.disabled) {
    return response.status(401).json({
      error: 'Your account have been banned. Contact admin to unblock account',
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: config.TOKEN_TTL })

  const session = {
    userId: user.id,
    token
  }

  await Session.create(session)

  response.status(200).send({ token, username: user.username, name: user.name, id: userForToken.id })
})

loginRouter.get(
  '/logout',
  middleware.verifyToken,
  middleware.userExtractor,
  async (request, response) => {
    await Session.destroy({
      where: {
        userId: request.userId,
        token: request.token
      }
    })

    response.status(204).end()
  }
)

module.exports = loginRouter