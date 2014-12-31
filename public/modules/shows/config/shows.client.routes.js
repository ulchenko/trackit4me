'use strict';

//Setting up route
angular.module('shows').config(['$stateProvider',
	function($stateProvider) {
		// Shows state routing
		$stateProvider.
		state('listShows', {
			url: '/shows',
			templateUrl: 'modules/shows/views/list-shows.client.view.html'
		}).
		state('viewShow', {
			url: '/shows/:showId',
			templateUrl: 'modules/shows/views/view-show.client.view.html'
		});
	}
]);