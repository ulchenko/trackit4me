'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Episode = mongoose.model('Episode'),
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
		seen: Boolean,
		productionStatus: String,
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

SeasonSchema.methods.createEpisodes = function(user, model, episodes) {
	var res = [];

	if (episodes) {
		var episode;
		for (var i = 0; i < episodes.length; i++) {
			var data = episodes[i];
			episode = null;
			for (var j = 0; j < model.episodes.length; j++) {
				var tmp = model.episodes[j];
				if (tmp._id == data.code) {
					episode = tmp;
					break;
				}
			}

			if (!episode) {
				episode = new Episode();
				episode._id = data.code;
				episode.episodeNumberSeason = data.episodeNumberSeason;
				episode.episodeNumberSeries = data.episodeNumberSeries;
				episode.originalBroadcastDate = data.originalBroadcastDate;
				episode.originalTitle = data.originalTitle;
				episode.synopsis = data.synopsis;
				episode.title = data.title ? data.title : data.originalTitle;
				episode.seasonId = model._id;
				model.episodes.push(episode._id);
				episode.save();
			}
			if (user && episode.viewers.indexOf(user.id) == -1)
				res.push(episode);
		};
	}
	return res;
};

var Season = mongoose.model('Season', SeasonSchema); // our base model