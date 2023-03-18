const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const loginRouter = require('express').Router()
const { User } = require('../models')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({
    where: {username: username}
  })
  const passwordCorrect =
    user === null ? false : await bcryptjs.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: '48h' })

  response.status(200).send({ token, username: user.username, name: user.name, id: userForToken.id })
})

module.exports = loginRouter