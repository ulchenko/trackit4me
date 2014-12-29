'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var shows = require('../../app/controllers/shows.server.controller');

	// Shows Routes
	app.route('/shows')
	.get(shows.list)
	.post(shows.search);

	app.route('/episodes/')
	.get(shows.getepisodes);
	
	app.route('/shows/:showId')
	.get(shows.read)
	.put(users.requiresLogin, shows.hasAuthorization, shows.update)
	.subscribe(users.requiresLogin, shows.subscribe)
	.unsubscribe(users.requiresLogin, shows.unsubscribe)
	.delete(users.requiresLogin, shows.hasAuthorization, shows.delete);

	
	// Finish by binding the Show middleware
	app.param('showId', shows.showByID);
};
