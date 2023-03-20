const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('users', 'disabled', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.addColumn('users', 'admin', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('users', 'disabled')
    await queryInterface.removeColumn('users', 'admin')
    await queryInterface.dropTable('sessions')
  },
}