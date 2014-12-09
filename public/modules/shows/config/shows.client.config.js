'use strict';

// Configuring the Articles module
angular.module('shows').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Shows', 'shows', 'item', 'shows');
	}
]);