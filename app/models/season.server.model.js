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
		episodeCount: Number,
		seasonNumber: Number,
		showId: {
			type: Number,
			ref: 'Show'
		},
		picture: String,
		productionStatus: Object,
		yearEnd: String,
		yearStart: String,
		episodes: [{
			type: Number,
			ref: 'Episode'
		}]
	});
}

util.inherits(BaseShowSchema, Schema);

var SeasonSchema = new BaseShowSchema();

var cleanJson = function(data) {
	var str = JSON.stringify(data);
	str = str.replace(/"\$\"/g, '\"value\"');
	return JSON.parse(str);

};

var Season = mongoose.model('Season', SeasonSchema); // our base model