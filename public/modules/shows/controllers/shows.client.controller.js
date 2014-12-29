'use strict';

// Shows controller
angular.module('shows').controller('ShowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shows', 'Episodes',
	function($scope, $stateParams, $location, Authentication, Shows, Episodes) {
		$scope.authentication = Authentication;

		// Create new Show
		$scope.search = function() {
			// Create new Show object
			var show = new Shows ({
				name: this.name,
				type: 'tvseries'
			});
			
			// Redirect after save
			show.$save(function(response) {
				$scope.shows = response.result;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Show
		$scope.remove = function(show) {
			if ( show ) { 
				show.$remove();

				for (var i in $scope.shows) {
					if ($scope.shows [i] === show) {
						$scope.shows.splice(i, 1);
					}
				}
			} else {
				$scope.show.$remove(function() {
					$location.path('shows');
				});
			}
		};

		// Update existing Show
		$scope.update = function() {
			var show = $scope.show;

			show.$update(function() {
				$location.path('shows/' + show._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Shows
		$scope.find = function() {
			$scope.shows = Shows.query();
		};

		// Find a list of Shows
		$scope.getepisodes = function(currentShow, season) {
			Episodes.get({showId:currentShow._id, seasonId: season.code}, function (response, err) {
				console.log(response);
			});
		};
		
		// Find existing Show
		$scope.findOne = function() {
			$scope.show = Shows.get({showId: $stateParams.showId}, function (show) {
				//isSubscribe
				console.log(show);
				$scope.isSubscribed = function () {
					return $scope.show.subscribers.indexOf($scope.authentication.user._id) !== -1;
				};
				
				//subscribe
				$scope.subscribe = function () {
					var show = $scope.show;
					show.$subscribe(function() {
						$location.path('shows/' + show._id);
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				};
				
				//subscribe
				$scope.unsubscribe = function () {
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