const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const { User } = require('../models')
const { Blog } = require('../models')
const middleware = require('../utils/middleware')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await User.findOne({
    where: {
      username: username
    }
  })
  if (existingUser) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  if (password === undefined || password.length <= 3) {
    return response.status(400).json({ error: 'password must be longer than 3 symbols' })
  } else {
    const saltRounds = 10
    const passwordHash = await bcryptjs.hash(password, saltRounds)

    const user = {
      username,
      name,
      passwordHash
    }

    const savedUser = await User.create(user)

    response.status(201).json(savedUser)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })

  response.json(users)
})

usersRouter.put(
  '/:id',
  middleware.verifyToken,
  middleware.userExtractor,
  async (request, response) => {
    const { username, name, password } = request.body

    // const existingUser = await User.findOne({
    //   where: {username: username}
    // })
    // if (existingUser) {
    //   return response.status(400).json({ error: 'username must be unique' })
    // }

    if (password === undefined || password.length <= 3) {
      return response
        .status(400)
        .json({ error: 'Username and password must be longer than 3 symbols' })
    } else {
      if (request.userId !== request.params.id) {
        return response.status(401).json({ error: 'User attempts to change another users data or invalid user id' })
      } else {
        const saltRounds = 10
        const passwordHash = await bcryptjs.hash(password, saltRounds)

        const user = await User.findByPk(request.params.id)

        user.username = username
        user.name = name
        user.passwordHash = passwordHash

        await user.save()

        response.json(user)
      }
    }
  },
)

usersRouter.get('/:id', async (request, response) => {

  const user = await User.findByPk(request.params.id, {
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })

  if (user) {
    response.json(user)
  } else {
    throw new Error('No user entry')
  }
})

module.exports = usersRouter