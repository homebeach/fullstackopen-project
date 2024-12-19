'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Create the users table with all columns
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_type: {
        type: DataTypes.ENUM('customer', 'librarian', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async ({ context: queryInterface }) => {
    // Drop the users table
    await queryInterface.dropTable('users');
  },
};
