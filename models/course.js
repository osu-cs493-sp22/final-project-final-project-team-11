const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const Course = sequelize.define('course', {
  subject: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  term: { type: DataTypes.STRING, allowNull: false },
  instructor: {type: DataTypes.STRING, allowNull: false}
})

exports.Course = Course
exports.CourseClientField = [
  'subject',
  'number',
  'title',
  'term',
  'instructor'
]

