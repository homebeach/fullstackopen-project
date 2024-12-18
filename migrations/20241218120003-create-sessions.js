'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Create the sessions table
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
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Add an index to the user_id column for performance optimization
    await queryInterface.addIndex('sessions', ['user_id']);
  },

  down: async ({ context: queryInterface }) => {
    // Remove the index and drop the table
    await queryInterface.removeIndex('sessions', ['user_id']);
    await queryInterface.dropTable('sessions');
  },
};
