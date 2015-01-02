'use strict';

//Shows service used to communicate Shows REST endpoints
angular.module('shows').factory('Seasons', ['$resource',
	function($resource) {
		return $resource('seasons/:id', {
			id: '@id'
		}, {
			getEpisodes: {
				method: 'GET',
				params: {
					id: '@id'
				}
			},
			update: {
				method: 'PUT',
				params: {
					id: '@id'
				} // this method issues a PUT request
			}
		});
	}
]);