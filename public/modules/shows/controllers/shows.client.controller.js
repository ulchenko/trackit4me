'use strict';

// Shows controller
angular.module('shows').controller('ShowsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shows', 'MyShows',
	'Seasons', 'Episodes', 'Search',

	function($scope, $stateParams, $location, Authentication, Shows, MyShows, Seasons, Episodes, Search) {
		$scope.authentication = Authentication;

		var filter = 'tvseries';
		$scope.searchMode = false;
		$scope.listTitle = "Autres Séries";
		// Search a Show

	$scope.userIsLogged = function() {
			return angular.isDefined($scope.authentication.user.id); 
		};

		$scope.search = function() {
			Search.get({
				query: this.searchShow,
				filter: filter
			}, function(result, err) {
				$scope.searchMode = true;
				$scope.listTitle = "Résultats";
				$scope.shows = result;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Shows
		$scope.findHomeShows = function() {
			$scope.shows = {
				result: Shows.query()
			};
			if ($scope.authentication.user) {
				$scope.myshows = MyShows.query();
			}
		};

		$scope.hasEpisodeNotSeen = function(season) {
			return true;
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
			Episodes.update({
				id: episode._id
			}, function(result, err) {
				episode.seen = result.seen;
			});
		};

		// Find existing Show
		$scope.findOne = function() {
			Shows.get({
				showId: $stateParams.showId
			}, function(result) {
				//isSubscribe
				$scope.show = result;
				$scope.isSubscribed = function() {
					return $scope.show.subscribers.indexOf($scope.authentication.user._id) !== -1;
				};
			});
		};


		//subscribe
		$scope.subscribe = function() {
			var show = $scope.show;
			var seasons = show.seasons;
			show.$subscribe(function(result, err) {
				show.seasons = seasons;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		//subscrib a show
		$scope.unsubscribe = function() {
			var show = $scope.show;
			var seasons = show.seasons;
			show.$unsubscribe(function(result, err) {
				show.seasons = seasons;
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);