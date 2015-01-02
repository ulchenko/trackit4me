'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	util = require('util');

var JSONS = require('json-serialize');


/**
 * Base Show Schema
 */

function BaseShowSchema() {
	Schema.apply(this, arguments);

	this.add({
		_id: Number,
		episodeNumberSeason: Number,
		episodeNumberSeries: Number,
		originalBroadcastDate: Date,
		originalTitle: String,
		synopsis: String,
		title: String,
		seasonId: {
			type: Number,
			ref: 'Season'
		},
		viewers: [{
			type: Number,
			ref: 'User'
		}]
	});
}

util.inherits(BaseShowSchema, Schema);

var EpisodeSchema = new BaseShowSchema();

var Episode = mongoose.model('Episode', EpisodeSchema); // our base model