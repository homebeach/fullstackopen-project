'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('library_items', 'copies_available', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('library_items', 'copies_available');
  },
};
