'use strict';

//Shows service used to communicate Shows REST endpoints
angular.module('shows').factory('Search', ['$resource',
	function($resource) {
		return $resource('search/', {}, {

		});
	}
]);