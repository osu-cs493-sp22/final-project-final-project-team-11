const { Router } = require('express')
const router = Router()

router.use('/users', require('./users'))
router.use('/assignments', require('./assignments'))

module.exports = router
