'use strict';

//Shows service used to communicate Shows REST endpoints
angular.module('shows').factory('MyShows', ['$resource',
	function($resource) {
		return $resource('myshows/', {

		}, {

		});
	}
]);