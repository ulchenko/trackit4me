'use strict';

//Shows service used to communicate Shows REST endpoints
angular.module('shows').factory('Episodes', ['$resource',
	function($resource) {
		return $resource('episodes/', {
		}, {
			
		});
	}
]);