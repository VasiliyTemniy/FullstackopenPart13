/* eslint-disable no-undef */
require('dotenv').config()

const PORT = process.env.PORT

const DATABASE_URL =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL

const SECRET = process.env.SECRET

module.exports = {
  DATABASE_URL,
  PORT,
  SECRET,
}