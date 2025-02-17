A problem reporting system with task management and dashboard analytics

## Features
-JWT authentication with access and refresh tokens
-CRUD operation for case management
-RESTful API endpoints for case management
-Rate limiting using fixed window algorithm
-CSRF protection
-input validation
-Analytics dashboard
-error handling
-caching (for getting adminlist while case creation/update)
-simple search

## Prerequisities
-Node.js
-Mongodb

## Installation
1. Clone the repository
git clone https://github.com/shingshing628/interview.git

2. git checkout docker-version1.0
it is linux application layer image,
for windows, need to download WSL

3. create .env by yourself
including:
MONGODB_URI
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
NODE_ENV=development (optional)

4. run in docker (Currently just run on localhost)