const { Router } = require('express')

//const { Business } = require('../models/business')
//const { Photo } = require('../models/photo')
//const { Review } = require('../models/review')
const { ValidationError } = require('sequelize')

const router = Router()

const bcrypt = require('bcryptjs')

const { validateAgainstSchema } = require('../lib/validation')
const { UserSchema, insertNewUser, getUserById, UserClientFields, getUserByEmail } = require('../models/user')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

router.post('/', requireAuthentication, async function (req, res, next) {
  console.log("== req.user:", req.user)

  const getUser = await getUserById(req.user)
  console.log("==getUser admin:", getUser.admin)

  if(req.body.admin == true && getUser.admin != true){
    next()
  } else {
    try {
      const userid = await insertNewUser(req.body)
      res.status(201).send({ id: userid })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.errors })
      } else {
        throw e
      }
    }
  }
})

router.post('/login', async function (req, res) {
  if (req.body && req.body.email && req.body.password) {
    const user = await getUserByEmail(req.body.email, true)
    const authenticated = user && await bcrypt.compare(
      req.body.password,
      user.password
    )
    if (authenticated) {
      const token = generateAuthToken(user.id)
      res.status(200).send({ token: token })
    } else {
      res.status(401).send({
        error: "Invalid credentials"
      })
    }
  } else {
    res.status(400).send({
      error: "Request needs user email and password."
    })
  }
})
router.delete('/:userid', async function (req, res, next) {
  const userid = req.params.userid
  const result = await UserSchema.destroy({ where: { id: userid } })
  if (result > 0) {
    res.status(204).send()
  } else {
    next()
  }
})

router.get('/:id', requireAuthentication, async function (req, res, next) {
  console.log("== req.user:", req.user)

  const getUser = await getUserById(req.user)
  console.log("== getUser:", getUser.admin)
  if(getUser)


  if ( (req.user != req.params.id) && (getUser.admin == false) ) {
    // res.status(403).send({
    //     err: "Unauthorized to access the specified resource"
    // })
    console.log("above")
    next()
  } else {
    const user = await getUserById(req.params.id, false)
    console.log("== req.headers:", req.headers)
    if (user) {
      res.status(200).send(user)
    } else {
      console.log("below")
      next()
    }
  }
})

module.exports = router
/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, async function (req, res, next) {
  console.log("== req.user:", req.user)

  const getUser = await getUserById(req.user)
  console.log("== getUser:", getUser.admin)

  if ( (req.user != req.params.userId) && (getUser.admin == false) ) {
    // res.status(403).send({
    //     err: "Unauthorized to access the specified resource"
    // })
    next()
  } else {
    const userId = req.params.userId
    const userBusinesses = await Business.findAll({ where: { ownerId: userId } })
    res.status(200).json({
      businesses: userBusinesses
    })
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, async function (req, res, next) {
  console.log("== req.user:", req.user)

  const getUser = await getUserById(req.user)
  console.log("== getUser:", getUser.admin)

  if ( (req.user != req.params.userId) && (getUser.admin == false) ) {
    // res.status(403).send({
    //     err: "Unauthorized to access the specified resource"
    // })
    next()
  } else {
    const userId = req.params.userId
    const userReviews = await Review.findAll({ where: { userId: userId } })
    res.status(200).json({
      reviews: userReviews
    })
  }
})


/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res, next) {
  console.log("== req.user:", req.user)
  
  const getUser = await getUserById(req.user)
  console.log("== getUser:", getUser.admin)

  if ( (req.user != req.params.userId) && (getUser.admin == false) ) {
    // res.status(403).send({
    //     err: "Unauthorized to access the specified resource"
    // })
    next()
  } else {
    const userId = req.params.userId
    const userPhotos = await Photo.findAll({ where: { userId: userId } })
    res.status(200).json({
      photos: userPhotos
    })
  }
})

module.exports = router
