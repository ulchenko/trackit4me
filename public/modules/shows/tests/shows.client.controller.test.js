'use strict';

(function() {
	// Shows Controller Spec
	describe('Shows Controller Tests', function() {
		// Initialize global variables
		var ShowsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Shows controller.
			ShowsController = $controller('ShowsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Show object fetched from XHR', inject(function(Shows) {
			// Create sample Show using the Shows service
			var sampleShow = new Shows({
				name: 'New Show'
			});

			// Create a sample Shows array that includes the new Show
			var sampleShows = [sampleShow];

			// Set GET response
			$httpBackend.expectGET('shows').respond(sampleShows);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.shows).toEqualData(sampleShows);
		}));

		it('$scope.findOne() should create an array with one Show object fetched from XHR using a showId URL parameter', inject(function(Shows) {
			// Define a sample Show object
			var sampleShow = new Shows({
				name: 'New Show'
			});

			// Set the URL parameter
			$stateParams.showId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/shows\/([0-9a-fA-F]{24})$/).respond(sampleShow);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.show).toEqualData(sampleShow);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Shows) {
			// Create a sample Show object
			var sampleShowPostData = new Shows({
				name: 'New Show'
			});

			// Create a sample Show response
			var sampleShowResponse = new Shows({
				_id: '525cf20451979dea2c000001',
				name: 'New Show'
			});

			// Fixture mock form input values
			scope.name = 'New Show';

			// Set POST response
			$httpBackend.expectPOST('shows', sampleShowPostData).respond(sampleShowResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Show was created
			expect($location.path()).toBe('/shows/' + sampleShowResponse._id);
		}));

		it('$scope.update() should update a valid Show', inject(function(Shows) {
			// Define a sample Show put data
			var sampleShowPutData = new Shows({
				_id: '525cf20451979dea2c000001',
				name: 'New Show'
			});

			// Mock Show in scope
			scope.show = sampleShowPutData;

			// Set PUT response
			$httpBackend.expectPUT(/shows\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/shows/' + sampleShowPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid showId and remove the Show from the scope', inject(function(Shows) {
			// Create new Show object
			var sampleShow = new Shows({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Shows array and include the Show
			scope.shows = [sampleShow];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/shows\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleShow);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.shows.length).toBe(0);
		}));
	});
}());