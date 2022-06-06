const { Router } = require('express')

const { ValidationError, Op } = require('sequelize')

const router = Router()

const { validateAgainstSchema } = require('../lib/validation')
const { Course, insertNewCourse, getCourseById } = require('../models/course')
const { getUserById } = require('../models/user')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

router.post('/', requireAuthentication, async function (req, res, next) {
  const usr = await getUserById(req.user)
  console.log("role: ", usr.role)

  if(usr.role == "admin") {
    try {
        const courseid = await insertNewCourse(req.body)
        res.status(201).send({ id: courseid })
      } catch (e) {
        if (e instanceof ValidationError) {
          res.status(400).send({ error: e.errors })
        } else {
            throw e
        }
      }
  } else {
    res.status(403).send({err: "You do not have permissions to perform this action"})
  }
})

router.get('/', async function (req, res, next) {
  let subject = req.query.subject
  let number = req.query.number
  let term = req.query.term
  let filter = {}
  if (subject) {
    filter.subject = subject
  }
  if (number) {
    filter.number = number
  }
  if (term) {
    filter.term = term
  }

  let page = parseInt(req.query.page) || 1
  page = page < 1 ? 1 : page
  const numPerPage = 5
  const offset = (page - 1) * numPerPage

  const result = await Course.findAndCountAll({
    where: filter,
    limit: numPerPage,
    offset: offset
  })

  const lastPage = Math.ceil(result.count / numPerPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/courses?page=${page + 1}`
    links.lastPage = `/courses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/courses?page=${page - 1}`
    links.firstPage = '/courses?page=1'
  }

  res.status(200).json({
    courses: result.rows,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: result.count,
    links: links
  })
  console.log("Get all the courses - exlude the sutdent and assignment list")
})

router.get('/:courseid', async function (req, res, next) {
  console.log("Get the class details excluding students and assignments")
  const courseid = req.params.courseid
  try {
    const course = await getCourseById(courseid)
    if (course) {
      res.status(201).send({ crs: course })
    } else {
      res.status(404).send({err: "course does not exist"})
    }
  } catch (e) {
    if (e instanceof ValidationError) {
        res.status(400).send({ error: e.errors })
      } else {
          throw e
      }
  }
})

router.patch('/:courseid', async function (req, res, next) {
  console.log("modify a course information")
  res.status(200).send({mess: "modify a course information"})
})

router.delete('/:courseid', async function (req, res, next) {
  console.log("delete a course")
  const courseid = req.params.courseid
  const result = await Course.destroy({ where: { id: courseid } })
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

module.exports = router
