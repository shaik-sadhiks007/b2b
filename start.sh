#!/bin/bash
(cd b2b-landingPage && npm run dev) &
(cd backend && npm run dev) &
(cd restaurant && npm run dev) &
wait 