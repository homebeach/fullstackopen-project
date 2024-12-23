const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class LibraryItem extends Model {}

LibraryItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorArtist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  publishedDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('book', 'magazine', 'cd', 'dvd', 'blu-ray'),
    allowNull: false,
  },
  copiesAvailable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'libraryItem',
});

module.exports = LibraryItem;
