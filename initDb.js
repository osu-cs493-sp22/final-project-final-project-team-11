/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */

const sequelize = require('./lib/sequelize')
const { UserSchema, UserClientFields } = require('./models/user')
const { Assignment, AssignmentClientFields } = require('./models/user')

const userData = require('./data/users.json')
const assignmentData = require('./data/assignments.json')

sequelize.sync().then(async function () {
  await UserSchema.bulkCreate(userData, { fields: UserClientFields })
  await Assignment.bulkCreate(assignmentData, { fields: AssignmentClientFields })
})
