'use strict';

// Shows controller
angular.module('shows').controller('ShowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shows', 'Episodes', 'Search',

	function($scope, $stateParams, $location, Authentication, Shows, Episodes, Search) {
		$scope.authentication = Authentication;

		var filter = 'tvseries';

		// Search a Show
		$scope.search = function() {
			Search.get({
				query: this.searchShow,
				filter: filter
			}, function(response, err) {
				$scope.response = response;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Shows
		$scope.find = function() {
			$scope.response = {
				result: Shows.query()
			};
		};

		// Find a list of Shows
		$scope.getepisodes = function(currentShow, season) {
			Episodes.get({
				showId: currentShow._id,
				seasonId: season.code
			}, function(response, err) {
				console.log(response);
			});
		};

		// Find existing Show
		$scope.findOne = function() {
			$scope.show = Shows.get({
				showId: $stateParams.showId
			}, function(show) {
				//isSubscribe
				console.log(show);
				$scope.isSubscribed = function() {
					return $scope.show.subscribers.indexOf($scope.authentication.user._id) !== -1;
				};

				//subscribe
				$scope.subscribe = function() {
					var show = $scope.show;
					show.$subscribe(function() {
						$location.path('shows/' + show._id);
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				};

				//subscribe
				$scope.unsubscribe = function() {
					var show = $scope.show;
					show.$unsubscribe(function() {
						$location.path('shows/' + show._id);
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				};

			});
		};
	}
]);