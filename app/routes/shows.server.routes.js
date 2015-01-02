'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var shows = require('../../app/controllers/shows.server.controller');

	// Shows Routes
	app.route('/shows')
		.get(shows.list);

	app.route('/shows/:showId')
		.get(shows.read)
		.subscribe(users.requiresLogin, shows.subscribe)
		.unsubscribe(users.requiresLogin, shows.unsubscribe);

	app.route('/search/')
		.get(shows.search);

	app.route('/seasons/:id')
		.get(shows.getEpisodes);

	app.route('/episodes/')
		.get(shows.getEpisodes);

	app.route('/episodes/:id')
		.put(shows.updateEpisode);


	// Finish by binding the Show middleware
	app.param('showId', shows.showByID);
};