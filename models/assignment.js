const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const Assignment = sequelize.define('assignment', {
  courseId: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false },
  due: { type: DataTypes.DATE, allowNull: false }
})

exports.Assignment = Assignment
exports.AssignmentClientField = [
  'courseId',
  'title',
  'points',
  'due'
]

