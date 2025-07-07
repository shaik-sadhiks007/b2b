const express = require('express');
const router = express.Router();
const { resolveSubdomain, createSubdomain } = require('../controllers/subdomainController');

// GET /resolve-subdomain/:subdomain
router.get('/:subdomain', resolveSubdomain);

// POST /api/subdomain
router.post('/', createSubdomain);

module.exports = router;
