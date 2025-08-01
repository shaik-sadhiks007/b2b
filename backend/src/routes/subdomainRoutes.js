const express = require('express');
const router = express.Router();
const { resolveSubdomain, getBusinessBySubdomain } = require('../controllers/subdomainController');

// GET /resolve-subdomain/:subdomain
router.get('/:subdomain', resolveSubdomain);

// GET /business/:subdomain - Get business details by subdomain
router.get('/business/:subdomain', getBusinessBySubdomain);

module.exports = router;
