'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'firstname', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('users', 'lastname', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('users', 'other_names', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'user_type', {
      type: Sequelize.ENUM('customer', 'librarian', 'admin'),
      allowNull: false,
      defaultValue: 'customer',
    });
    await queryInterface.removeColumn('users', 'name');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn('users', 'firstname');
    await queryInterface.removeColumn('users', 'lastname');
    await queryInterface.removeColumn('users', 'other_names');
    await queryInterface.removeColumn('users', 'user_type');
  },
};
