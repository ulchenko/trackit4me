'use strict';

// Shows controller
angular.module('shows').controller('ShowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shows', 'Seasons', 'Episodes', 'Search',

	function($scope, $stateParams, $location, Authentication, Shows, Seasons, Episodes, Search) {
		$scope.authentication = Authentication;

		var filter = 'tvseries';

		// Search a Show
		$scope.search = function() {
			Search.get({
				query: this.searchShow,
				filter: filter
			}, function(result, err) {
				console.log(result);
				$scope.shows = result;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Shows
		$scope.find = function() {
			$scope.shows = {
				result: Shows.query()
			};
		};

		// Find a episodes of season
		$scope.getEpisodes = function(season) {
			Seasons.getEpisodes({
				id: season._id
			}, function(result, err) {
				console.log(result);
				$scope.episodes = result.result.episodes;
			});
		};

		// set episode to view state or not
		$scope.updateEpisode = function(episode) {
			console.log(episode);
			Episodes.update({
				id: episode._id
			}, function(result, err) {
				console.log(result);
			});
		};

		// Find existing Show
		$scope.findOne = function() {
			Shows.get({
				showId: $stateParams.showId
			}, function(result) {
				//isSubscribe
				$scope.show = result;
				console.log(result);
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

				//subscribshow.e
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