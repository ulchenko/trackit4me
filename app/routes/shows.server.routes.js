'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var shows = require('../../app/controllers/shows.server.controller');

	// Shows Routes
	app.route('/shows')
		.get(shows.list);

	app.route('/episodes/')
		.get(shows.getepisodes);

	app.route('/search/')
		.get(shows.search);

	app.route('/shows/:showId')
		.get(shows.read)
		.subscribe(users.requiresLogin, shows.subscribe)
		.unsubscribe(users.requiresLogin, shows.unsubscribe);


	// Finish by binding the Show middleware
	app.param('showId', shows.showByID);
};