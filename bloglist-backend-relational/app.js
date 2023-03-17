const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
// const cors = require('cors')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
// const usersRouter = require('./controllers/users')
// const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')


// app.use(cors())
// app.use(express.static('build'))
app.use(express.json())

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(config.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
});
logger.info('connecting to', config.DATABASE_URL)


app.use(middleware.requestLogger)

// app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
// app.use('/api/users', usersRouter)

// eslint-disable-next-line no-undef
// if (process.env.NODE_ENV === 'test') {
//   const testingRouter = require('./controllers/testing')
//   app.use('/api/testing', testingRouter)
// }

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app







require('dotenv').config()


const main = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    sequelize.close()
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

main()