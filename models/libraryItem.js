const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class LibraryItem extends Model {}

LibraryItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field
    },
    publishedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('book', 'magazine', 'cd', 'dvd', 'blu-ray'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'libraryItem',
    underscored: true,
    timestamps: true,
  }
);

module.exports = LibraryItem;
