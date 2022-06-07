const { Router } = require('express')

const { ValidationError, Op } = require('sequelize')

const router = Router()

const { validateAgainstSchema } = require('../lib/validation')
const { Course, CourseClientField, insertNewCourse, getCourseById } = require('../models/course')
const { getUserById } = require('../models/user')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

/*
  API endpoint for adding a new course
*/
router.post('/', requireAuthentication, async function (req, res, next) {
  const usr = await getUserById(req.user)
  //console.log("role: ", usr.role)

  if(usr.role == "admin") {
    try {
        const courseid = await insertNewCourse(req.body)
        res.status(201).send({ id: courseid })
      } catch (e) {
        if (e instanceof ValidationError) {
          res.status(400).send({ error: "Invalid request body supplied" })
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
  //console.log("Get all the courses - exlude the sutdent and assignment list")
})

router.get('/:courseid', async function (req, res, next) {
  //console.log("Get the class details excluding students and assignments")
  const courseid = req.params.courseid

  try {
    const course = await getCourseById(courseid)
    const user = await getUserById(course.instructor)
    if (course) {
      res.status(201).send({ 
        course: {
          info: course,
          instructor: user
        }
      })
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

/*
 * Route to update data for a course.
 */
router.patch('/:courseid', requireAuthentication, async function (req, res, next) {
  //console.log("== req.user:", req.user)
  const courseid = req.params.courseid

  const user = await getUserById(req.user)
  const exCourse = await getCourseById(courseid)
  //console.log("==getCourse:", exCourse)
  //console.log("==user:", req.user)

  if (user.role == "admin" || (user.role == "instructor" && exCourse.instructor == req.user)) {
    try {
      const result = await Course.update(req.body, {
        where: { id: courseid },
        fields: CourseClientField
      })
      if (result[0] > 0) {
        res.status(204).send()
      } else {
        next()
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: "Invalid request body supplied" })
      } else {
          throw e
      }
    }
  } else {
    res.status(400).send({ error: "You do not have the permissions to edit this course"})
  }
})

router.delete('/:courseid', async function (req, res, next) {
  //console.log("delete a course")
  const courseid = req.params.courseid
  const result = await Course.destroy({ where: { id: courseid } })
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

module.exports = router
