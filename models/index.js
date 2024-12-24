const User = require('./user');
const Session = require('./session');
const LibraryItem = require('./libraryItem');
const BorrowedItem = require('./borrowedItem');

User.hasMany(BorrowedItem);
BorrowedItem.belongsTo(User);

LibraryItem.hasMany(BorrowedItem);
BorrowedItem.belongsTo(LibraryItem);

module.exports = {
  User,
  Session,
  LibraryItem,
  BorrowedItem
};
