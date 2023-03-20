const adminRouter = require('express').Router()
const { User, Session } = require('../models')
const middleware = require('../utils/middleware')

adminRouter.put(
  '/users/:id',
  middleware.verifyToken,
  middleware.userExtractor,
  middleware.sessionCheck,
  async (request, response) => {

    const userAdmin = request.user

    if (!userAdmin.admin) {
      response.status(403).json({ error: 'You have no admin permissions' })
    }

    const userSubject = await User.scope('all').findByPk(request.params.id)

    if (!userSubject) {
      response.status(403).json({ error: `No user entry with this id ${request.params.id}` })
    } else {
      userSubject.disabled = request.body.disabled

      if (userSubject.disabled) {
        await Session.destroy({
          where: {
            userId: userSubject.id,
          }
        })
      }

      await userSubject.save()
      response.json(userSubject)
    }

  }
)

module.exports = adminRouter