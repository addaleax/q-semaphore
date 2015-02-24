q-semaphore
============

[![NPM Version](https://img.shields.io/npm/v/q-semaphore.svg?style=flat)](https://npmjs.org/package/q-semaphore)
[![NPM Downloads](https://img.shields.io/npm/dm/q-semaphore.svg?style=flat)](https://npmjs.org/package/q-semaphore)
[![Build Status](https://travis-ci.org/addaleax/q-semaphore.svg?style=flat&branch=master)](https://travis-ci.org/addaleax/q-semaphore?branch=master)
[![Coverage Status](https://coveralls.io/repos/addaleax/q-semaphore/badge.svg?branch=master)](https://coveralls.io/r/addaleax/q-semaphore?branch=master)
[![Dependency Status](https://david-dm.org/addaleax/q-semaphore.svg?style=flat)](https://david-dm.org/addaleax/q-semaphore)
[![devDependency Status](https://david-dm.org/addaleax/q-semaphore/dev-status.svg?style=flat)](https://david-dm.org/addaleax/q-semaphore#info=devDependencies)

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
