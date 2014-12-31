'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	util = require('util');

/**
 * Base Show Schema
 */

function BaseShowSchema() {
	Schema.apply(this, arguments);

	this.add({
		_id: Number,
		seasonId: Number,
		viewers: [{
			type: Number,
			ref: 'User'
		}]
	});
}

util.inherits(BaseShowSchema, Schema);

var EpisodeSchema = new BaseShowSchema();

var cleanJson = function(data) {
	var str = JSON.stringify(data);
	str = str.replace(/"\$\"/g, '\"value\"');
	return JSON.parse(str);

};

var Episode = mongoose.model('Episode', EpisodeSchema); // our base model