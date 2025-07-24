const express = require('express');
const router = express.Router();
const { resolveSubdomain } = require('../controllers/subdomainController');

// GET /resolve-subdomain/:subdomain
router.get('/:subdomain', resolveSubdomain);

module.exports = router;
