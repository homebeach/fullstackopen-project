const { DataTypes, Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Enforcing uniqueness of the token
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // The table name for the Users model
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Adding an index to user_id to improve query performance
    await queryInterface.addIndex('sessions', ['user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the sessions table and remove the index if it was added
    await queryInterface.removeIndex('sessions', ['user_id']);
    await queryInterface.dropTable('sessions');
  },
};