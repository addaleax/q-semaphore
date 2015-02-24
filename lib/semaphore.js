"use strict";

var Q = require('q');

module.exports = function(capacity) {
	var semaphore = {
		capacity: capacity || 1,
		current: 0,
		queue: [],

		take: function(n) {
			n = n || 1;
			
			if (n > semaphore.capacity) {
				throw new Error("Cannot take semaphore with n greater than capacity");
			}
			
			if (semaphore.current + n > semaphore.capacity) {
				var item = {
					n: n,
					deferred: Q.defer()
				};
			
				semaphore.queue.push(item);
				return item.deferred.promise;
			}

			semaphore.current += n;
			return Q(semaphore.leave);
		},

		leave: function(n) {
			n = n || 1;

			semaphore.current -= n;

			if (!semaphore.queue.length) {
				if (semaphore.current < 0) {
					throw new Error('leave called too many times.');
				}

				return Q();
			}

			var item = semaphore.queue[0];

			if (item.n + semaphore.current > semaphore.capacity) {
				return Q();
			}

			semaphore.queue.shift();
			semaphore.current += item.n;

			item.deferred.resolve(semaphore.leave);
			return item.deferred.promise;
		}
	};

	return semaphore
};
