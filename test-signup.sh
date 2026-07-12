#!/bin/bash

# Test signup API
curl -X POST https://fashion-ecommerce-platform-ohou.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Test@1234"
  }'
