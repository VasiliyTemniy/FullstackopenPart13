const authorsRouter = require('express').Router()
const { Blog } = require('../models')
const sequelize = require('sequelize')

authorsRouter.get('/', async (request, response) => {

  const blogs = await Blog.findAll({
    attributes: [
      'author',
      [sequelize.fn('COUNT', sequelize.col('author')), 'articles'],
      [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
    ],
    group: ['author'],
    order: [
      ['likes', 'DESC']
    ]
  })

  response.json(blogs)
})

module.exports = authorsRouter