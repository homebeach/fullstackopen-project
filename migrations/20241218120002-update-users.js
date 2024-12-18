const { DataTypes, Sequelize } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Add new columns to the users table
    await queryInterface.addColumn('users', 'firstname', {
      type: DataTypes.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('users', 'lastname', {
      type: DataTypes.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('users', 'other_names', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'user_type', {
      type: DataTypes.ENUM('customer', 'librarian', 'admin'),
      allowNull: false,
      defaultValue: 'customer',
    });

    // Remove the existing 'name' column
    await queryInterface.removeColumn('users', 'name');
  },

  down: async ({ context: queryInterface }) => {
    // Restore the 'name' column
    await queryInterface.addColumn('users', 'name', {
      type: DataTypes.STRING,
      allowNull: false,
    });

    // Remove the newly added columns
    await queryInterface.removeColumn('users', 'firstname');
    await queryInterface.removeColumn('users', 'lastname');
    await queryInterface.removeColumn('users', 'other_names');
    await queryInterface.removeColumn('users', 'user_type');
  },
};
