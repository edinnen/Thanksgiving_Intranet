const express = require('express');
const router = express.Router();

const api = require('./queries');

router.post('/led', api.LED);

module.exports = router;

