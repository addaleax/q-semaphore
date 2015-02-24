q-semaphore
============
Semaphore implementation for Q promises on Node.js

Install:
`npm install q-semaphore`

Limit simultaneous access to a resource.

```javascript
// Create
var sem = require('q-semaphore')(capacity);

// Take
sem.take([n=1]) // returns a promise

// Leave
sem.leave([n=1])
```

```javascript
// Limit concurrent db access
var sem = require('semaphore')(1);
var server = require('http').createServer(req, res) {
	sem.take().then(function() {
		expensive_database_operation(function(err, res) {
			sem.leave();

			if (err) return res.end("Error");

			return res.end(res);
		});
	});
});
```

```javascript
// 2 clients at a time
var sem = require('semaphore')(2);
var server = require('http').createServer(req, res) {
	res.write("Then good day, madam!");

	sem.take().then(function() {
		res.end("We hope to see you soon for tea.");
		sem.leave();
	});
});
```

```javascript
// Rate limit
var sem = require('semaphore')(10);
var server = require('http').createServer(req, res) {
	sem.take().then(function() {
		res.end(".");
		
		return Q.delay(500);
	}).then(sem.leave);
});
```

License
===

MIT

This is based on the [abrkn/semaphore.js](https://github.com/abrkn/semaphore.js) implementation.
