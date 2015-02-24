"use strict";

var assert = require('assert');
var Q = require('q');
var semaphore = require("../lib/semaphore.js");
require('mocha');

var Phone = function() {
	return {
		state: "free",

		dial: function() {
			if (this.state != "free")
				throw new Error("The phone is busy");

			this.state = "busy";

			return Q.delay(100);
		},

		hangup: function() {
			if (this.state == "free")
				throw new Error("The phone is not in use");

			this.state = "free";
		}
	};
};

it("should not be using a bad example", function() {
	var phone = new Phone();

	// Call Bob
	return phone.dial().then(function() {
		console.log('Dialed bob');
		// Cannot call Bret, because the phone is already busy with Bob.
		return Q().then(function() {
			return phone.dial();
		}).catch(function(err) {
			assert.ok(err);
		});
	}).then(function() {
		return phone.hangup();
	});
});

it("should not break the phone", function() {
	var phone = new Phone();
	var sem = semaphore(1);

	return Q.all([
		// Call Jane
		sem.take().then(function() {
			return phone.dial();
		}).then(function() {
			return phone.hangup();
		}).then(function() {
			return sem.leave();
		}),

		// Call Jon (will need to wait for call with Jane to complete)
		sem.take().then(function() {
			return phone.dial();
		}).then(function() {
			return phone.hangup();
		}).then(function() {
			return sem.leave();
		})
	]);
});

it('should not let past more than capacity', function(done) {
	this.timeout(6000);

	var s = semaphore(3);
	var values = [];
	var speed = 250;

	s.take().then(function() { values.push(1); setTimeout(function() { s.leave(); }, speed * 1); });
	s.take().then(function() { values.push(2); setTimeout(function() { s.leave(); }, speed * 2); });
	s.take().then(function(leave) { values.push(3); setTimeout(function() { leave(); }, speed * 3); });
	s.take().then(function() { values.push(4); });
	s.take().then(function() { values.push(5); });

	var tickN = 0;

	var check = function() {
		switch (tickN++) {
			case 0: // After 0 sec
				console.log("0 seconds passed.");
				assert.equal(s.current, s.capacity);
				assert.equal(s.queue.length, 2);
				assert.deepEqual(values, [1, 2, 3]);
				break;
			case 1: // After 1 sec
				console.log("1 seconds passed.");
				assert.equal(s.current, s.capacity);
				assert.equal(s.queue.length, 1);
				assert.deepEqual(values, [1, 2, 3, 4]);
				break;
			case 2: // After 2 sec
				console.log("2 seconds passed.");
				assert.equal(s.current, 3);
				assert.equal(s.queue.length, 0);
				assert.deepEqual(values, [1, 2, 3, 4, 5]);
				break;
			case 3: // After 3 sec
				console.log("3 seconds passed.");
				assert.equal(s.current, 2);
				assert.equal(s.queue.length, 0);
				assert.deepEqual(values, [1, 2, 3, 4, 5]);
				return done();
		}

		setTimeout(check, speed * 1.1);
	};

	setTimeout(check, speed * 0.2);
});

describe("should respect number", function() {
	it("should fail when taking more than the capacity allows", function() {
		var s = semaphore(1);

		return Q().then(function() {
			return s.take(2);
		}).catch(function(err) {
			assert.ok(err);
		});
	});

	it("should work fine with correct input values", function() {
		var s = semaphore(10); // 10

		return s.take(5).then(function(leave) { // 5
			return s.take(4).then(function() { // 1
				leave(4); // 5

				return s.take(5); // 0
			});
		});
	});
});
