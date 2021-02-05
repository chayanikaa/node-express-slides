class: primary
count: false

# Web servers with NodeJS

---

# Agenda

- Create a web server with the `http` module
  - Handling requests
- Web application frameworks
- Express
  - Routing
  - Middleware
  - Error Handling
  - Templates
- Practice time!

---

# The NodeJS HTTP Server

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.write('Hello World!');
  res.end();
}));

server.listen(8000);
```

---

# Adding a response header

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.write('<html><body>');
  res.write('<h1>HTTP server response!</h1>');
  res.end('</body></html>');
}));

server.listen(8000);
```

---

# Parsing query parameters

```js
// request GET http://localhost:8000/songs?artist=madonna

const http = require('http');
const URL = require('url').URL;

http.createServer((req, res) => {

  // req.url: /songs?artist=madonna
  // req.headers.host: localhost:8000
  const url = new URL(req.url, `http://${req.headers.host}`);
  const queryParams = url.searchParams;
  const artist = queryParams.get('artist'); //madonna

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(artist);
}).listen(8000);

```

---

# Sending a file

```js
const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': stat.size
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}).listen(8000);
```

---

# Web frameworks

- Make it easier to create an application.
- Provide ways to structure code; create a more maintainable application!

.image[![Express](assets/nodejs-frameworks.png)]

---

# Express

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

- Unopinionated
- Fast
- Lightweight
- Flexible

.right-image[![Express](assets/express.png)]

---

# Hello World

```bash
npm init
npm install express --save
```

```js
// app.js
const express = require('express');
const http = require('http');

const port = 3000;
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const httpServer = http.createServer(app);

httpServer.listen(port);
```

```bash
node app.js
```

---

# Routing

How an application handles requests based on:

Route:

- Method
- Path

Other request data:

- Query
- Headers
- Body

---

# Method

### `app.METHOD(path, callback [, callback ...])`

```
app.get('/', function (req, res) {
  res.send('GET request to the homepage')
})
```

||                                   
|:---|:---|:---|
| GET     | Retrieve whatever information is identified by the Request-URI
| HEAD    | Same as GET, but only transfer the status line and header section
| POST    | Perform resource-specific processing on the request payload
| PUT     | Replace all current representations of the target resource with request payload
| PATCH   | A set of changes described in the request entity be applied to the resource
| DELETE  | Remove all current representations of the target resource
| OPTIONS | Describe the communication options for the target resource

### `app.all()` for all types of requests

---

# app.route

- `app.route` creates an instance of **one** route.

```js
app.route('/events')
  .get(function (req, res) {
    res.json({})
  })
  .post(function (req, res) {
    // maybe add a new event...
  })
```

---

# Path

Can be a String, String pattern or Regex

```js
// string
app.get('/api/books', ...)

// string patterns
app.get('/ab+c', ...) // matches abc, abbc and so on.

app.get('/secrets/*', ...) // matches /secrets/, /secrets/token and so on

// regex
app.get(/.*cat$/, ...) // matches tomcat, nyancat, but not catwoman
```

---

# Path Params

- Path parameters are parsed and included in `req.params` object.
- Param names can contain 'word' characters `[A-Za-z0-9_]`

```js
app.get('/books/:bookId', function (req, res) {
  res.send(`GET request for book with ID ${req.params.bookId}`);
});
```

Use a regular expression in () to have more control over what is matched.
```js
app.get('/user/:userId(\\d+)', function (req, res) {
  res.send(`GET request for user ID ${req.params.userId}`);
});
```

---

# More Path Param Examples

'-' and '.' are interpreted literally and can be used in the following use cases.

```
Route path: /plantae/:genus.:species
Request URL: http://localhost:3000/plantae/Prunus.persica
req.params: { genus: "Prunus", species: "persica" }
```

```
Route path: /flights/:from-:to
Request URL: http://localhost:3000/flights/LAX-SFO
req.params: { from: "LAX", to: "SFO" }
```

---

# Query Params

- Typically used in GET requests
- Usually to search for some information with given query parameters
- Not present in the request path, but in `req.query`

```js
// Request: /books?author=jk%20rowling
app.get('/books', function (req, res) {
  // req.query: { author: 'jk rowling' }
});
```

---

# Response status

- use `res.status()`

### Common http statuses

| |                                   
|:----|:-----|:----|
|400 |Bad Request. ...
|401 |Unauthorized. ...
|403 |Forbidden. ...
|404 |Not Found. ...
|500 |Internal Server Error. ...
|502 |Bad Gateway. ...
|503 |Service Unavailable. ...
|504 |Gateway Timeout.

.right-image-small[![Express](assets/404.gif)]

---

# Responding to a request

- Express provides various ways to respond to a request.
- Abstracts away the complexity of setting headers such as 'Content-Length', 'Content-Type'.
- The request response cycle must be terminated using one of the following methods, or the request will remain hanging.

| |                                   
|:---|:---|:---|
|res.json()|Send a JSON response.
|res.render()|Render a view template.
|res.redirect()|Redirect a request.
|res.end()|End the response process.
|res.download()|Prompt a file to be downloaded.
|res.send()|Send a response of various types.
|res.sendFile()|Send a file as an octet stream.

---

# Bringing it all together, an example

.image[![Express](assets/puzzle.gif)]

---

### Well this is alright for a simple server, but what about when my app gets bigger?

.image[![Thinking](assets/thinking.gif)]

---

# Middleware

- Have access to the *req* and *res* objects.
- Control the request response flow. Can terminate the response cycle or call the *next()* middleware.

.right-image[![Express](assets/middleware.jpeg)]

---

# Simple Logging middleware

```js
app.use('/user/:id', function (req, res, next) {
  console.log(`${req.method} request made for user id: ${req.params.id}`);
  next();
});

app.get('/user/:id', function (req, res, next) {
  const userInfo = getUserInfoFromDB(id);
  res.json(userInfo);
});
```

---

# Some common middleware examples

- Built in:
  - `express.static()`: serving static content; html, images, etc
  - `express.json()`: parse json data in request body
  - `express.urlencoded()`: parse urlencoded data in request body
- Third party middleware
  - `morgan`: Logging middleware
  - `multer`: Accepting multipart form data
  - `helmet`: Security headers middleware
  - `express-session`: simple session creation middleware

---

# Routers

- A **mini-app** that is an encapsulated instance of middleware and routes.
- Can be created using `express.Router()`.
- Behaves like a middleware function.
- Can be plugged into another router using `router.use()`.
- Once a router is created, all http verbs can be used to route requests on its paths.

---

# Admin Router

```js
// router
const adminRouter = express.Router();

adminRouter.use((req, res, next) => {
  validateUserAuthorization(req)
    .then(() => next())
    .catch(e => res
      .status(403)
      .json({ msg: 'Not Authorized.' }));
});

adminRouter.delete('/user/:id', (req, res, next) => {
  User.delete(id)
    .then(deletedUser => res.status(200).json(deletedUser))
    .catch(e => handleError(e));
});

module.exports = adminRouter;
```

```js
// app.js
const adminRouter = require('routers/admin');

app.use('/admin', adminRouter);
```

---

# Error-handling middleware

- `err, req, res, next`

```gherkin
Given an express application
When a router handler `throw new Error()` in synchronous operations
# or
When `next(new Error())` in asynchronous operations
Then all non-error handling middleware will be skipped
```

```
app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

---

# Organizing our 'Books' example

.image[![Express](assets/refactor.gif)]

---

# Practice time!

.full-image[![Express](assets/practice-cat.gif)]

---

# Templates

```js
app.set('view engine', 'ejs')

app.get('/test', (req, res) => {
  res.render('index', { data });
})
```

- ejs
- pug
- nunjucks
- handlebars
- [mustache](https://mustache.github.io/)

---

# Summary

- Creating a NodeJS HTTP server.
- ExpressJS functionalities: Routing, middleware, views.

---

# Resources

- [Express Official Documentation](https://expressjs.com/)

- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

.right-image[![Express](assets/express.png)]

- [Node Best Practices](https://github.com/i0natan/nodebestpractices/blob/master/README.md)

- [Express Official Documentation](https://expressjs.com/)

- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

- [todo express-validator](https://express-validator.github.io/docs/)
