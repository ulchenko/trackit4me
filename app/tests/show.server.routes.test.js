'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Show = mongoose.model('Show'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, show;

/**
 * Show routes tests
 */
describe('Show CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Show
		user.save(function() {
			show = {
				name: 'Show Name'
			};

			done();
		});
	});

	it('should be able to save Show instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Show
				agent.post('/shows')
					.send(show)
					.expect(200)
					.end(function(showSaveErr, showSaveRes) {
						// Handle Show save error
						if (showSaveErr) done(showSaveErr);

						// Get a list of Shows
						agent.get('/shows')
							.end(function(showsGetErr, showsGetRes) {
								// Handle Show save error
								if (showsGetErr) done(showsGetErr);

								// Get Shows list
								var shows = showsGetRes.body;

								// Set assertions
								(shows[0].user._id).should.equal(userId);
								(shows[0].name).should.match('Show Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Show instance if not logged in', function(done) {
		agent.post('/shows')
			.send(show)
			.expect(401)
			.end(function(showSaveErr, showSaveRes) {
				// Call the assertion callback
				done(showSaveErr);
			});
	});

	it('should not be able to save Show instance if no name is provided', function(done) {
		// Invalidate name field
		show.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Show
				agent.post('/shows')
					.send(show)
					.expect(400)
					.end(function(showSaveErr, showSaveRes) {
						// Set message assertion
						(showSaveRes.body.message).should.match('Please fill Show name');
						
						// Handle Show save error
						done(showSaveErr);
					});
			});
	});

	it('should be able to update Show instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Show
				agent.post('/shows')
					.send(show)
					.expect(200)
					.end(function(showSaveErr, showSaveRes) {
						// Handle Show save error
						if (showSaveErr) done(showSaveErr);

						// Update Show name
						show.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Show
						agent.put('/shows/' + showSaveRes.body._id)
							.send(show)
							.expect(200)
							.end(function(showUpdateErr, showUpdateRes) {
								// Handle Show update error
								if (showUpdateErr) done(showUpdateErr);

								// Set assertions
								(showUpdateRes.body._id).should.equal(showSaveRes.body._id);
								(showUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Shows if not signed in', function(done) {
		// Create new Show model instance
		var showObj = new Show(show);

		// Save the Show
		showObj.save(function() {
			// Request Shows
			request(app).get('/shows')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Show if not signed in', function(done) {
		// Create new Show model instance
		var showObj = new Show(show);

		// Save the Show
		showObj.save(function() {
			request(app).get('/shows/' + showObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', show.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Show instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Show
				agent.post('/shows')
					.send(show)
					.expect(200)
					.end(function(showSaveErr, showSaveRes) {
						// Handle Show save error
						if (showSaveErr) done(showSaveErr);

						// Delete existing Show
						agent.delete('/shows/' + showSaveRes.body._id)
							.send(show)
							.expect(200)
							.end(function(showDeleteErr, showDeleteRes) {
								// Handle Show error error
								if (showDeleteErr) done(showDeleteErr);

								// Set assertions
								(showDeleteRes.body._id).should.equal(showSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Show instance if not signed in', function(done) {
		// Set Show user 
		show.user = user;

		// Create new Show model instance
		var showObj = new Show(show);

		// Save the Show
		showObj.save(function() {
			// Try deleting Show
			request(app).delete('/shows/' + showObj._id)
			.expect(401)
			.end(function(showDeleteErr, showDeleteRes) {
				// Set message assertion
				(showDeleteRes.body.message).should.match('User is not logged in');

				// Handle Show error error
				done(showDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Show.remove().exec();
		done();
	});
});