A problem reporting system with task management and dashboard analytics

## Features
-JWT authentication with access and refresh tokens
-Role-based Access Control (admin/user)   
-CRUD operation for case management
-RESTful API Architecture
-Rate limiting using fixed window algorithm
-CSRF protection
-input validation
-Analytics dashboard
-error handling
-caching (for getting adminlist while case creation/update)
-simple search

!!important. role could only be modified in database, please change role=admin if you would like to test admin function, otherwise, by default role=user

## Prerequisities
Download docker 

## Installation
1. Clone the repository
git clone -b docker_version1.0 https://github.com/shingshing628/interview.git

2. git checkout docker-version1.0
it is linux application layer image,
for windows, need to download WSL

3. create .env by yourself
including:
MONGODB_URI=mongodb://your-mongodb-uri
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
NODE_ENV=development (optional)

4. run in docker (Currently just run on localhost for practical)

## API Endpoints
1. Authentication
GET /user/login    #login page
POST /user/login  
GET /user/signup   #signup page
POST /user/signup
POST /user/logout
GET /user/profile  #profile page
PUT /user/profile
GET /user/passwordreset   #page to reset password
PUT /user/passwordreset

2. Case Management
GET /case/create  #page to create case
POST /case/create
GET /case/update?id=1     #page to get detail for each case, id is the corresponding _id in case database
PUT /case/update?id=1&type=update&_method=PUT   #there are two type, update/complete
GET /case/view        #homepage

3. API for fetch various JSON data
GET /api/getuser_info?search=query   #get user profile in JSON
GET /api/getcase   #get corresponding case belongs to corresponding admin/user
GET /api/searchcase?keyword=abc   #get searched result in JSON
GET /api/adminlist      #get list of admin by cache in return of JSON

4. Dashboard
GET /dashboard      #dashboard page
GET /dashboard_data  #get dashboard data in JSON

## Security Measures
- double JWT token
- Rate limiting: 200 requests per minute window
- CSRF token
- input validation
- Using helmet (./server/config/helmet.js)

## Error Handling
- 200: success ok
- 201: created success
- 400: bad request
- 401: unauthorized
- 403: Forbidden
- 404: page not found
- 409: request conflict
- 500: internal server error

## Known Limitations
- Currently runs on localhost only
- Just test on frontend
- Basic search functionality without convenient button to help user to search their own cases
- inline script in frontend
- Performance concerns with large datasets


