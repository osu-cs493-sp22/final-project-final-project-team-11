const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const Submission = sequelize.define('submission', {
  assignmentId: { type: DataTypes.STRING, allowNull: false },
  studentId: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false },
  grade: { type: DataTypes.STRING, allowNull: true },
  file: {type: DataTypes.STRING, allowNull: false}
})

exports.Submission = Submission
exports.SubmissionClientField = [
  'assignmentId',
  'studentId',
  'timestamp',
  'grade',
  'file'
]
