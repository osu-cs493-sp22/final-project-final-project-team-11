const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Assignment, AssignmentClientFields } = require('../models/assignment')
const { Submission, SubmissionClientField, insertNewSubmission } = require('../models/submission')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const router = Router()

router.get('/', async function (req, res) {
  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 10
  const offset = (page - 1) * numPerPage

  const result = await Assignment.findAndCountAll({
    limit: numPerPage,
    offset: offset
  })

  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/assignments?page=${page + 1}`
    links.lastPage = `/assignments?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/assignments?page=${page - 1}`
    links.firstPage = '/assignments?page=1'
  }

  res.status(200).json({
    assignments: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  })
})

router.post('/', requireAuthentication, async function (req, res, next) {
  try {
    const assignment = await Assignment.create(req.body, AssignmentClientFields)
    res.status(201).send({ id: assignment.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

router.get('/:assignmentId', requireAuthentication, async function (req, res, next) {
  const assignmentId = req.params.assignmentId
    const assignment = await Assignment.findByPk(assignmentId, {
      //include: [ Submission ]
    })
    if (assignment) {
      res.status(200).send(assignment)
    } else {
      next()
    }

})

router.delete('/:assignmentId', requireAuthentication, async function (req, res, next) {
  const assignmentId = req.params.assignmentId
  const result = await Assignment.destroy({ where: { id: assignmentId }})
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

router.patch('/:assignmentId', requireAuthentication, async function (req, res, next) {
  const assignmentId = req.params.assignmentId
  const result = await Assignment.update(req.body, {
    where: { id: assignmentId },
    fields: AssignmentClientFields
  })
  if (result[0] > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

/*
* Create Submission
*/
router.post('/:id/submissions', async function (req,res,next){
  try {
    const submission = await Submission.create(req.body, SubmissionClientField)
    res.status(201).send({ id: submission.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})
module.exports = router
