const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

class BorrowedItem extends Model {}

BorrowedItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  borrowDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true, // Can be null until the item is returned
  },
}, {
  sequelize,
  underscored: true,
  timestamps: true,
  modelName: 'borrowedItem',
});

module.exports = BorrowedItem;
