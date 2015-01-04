'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Season = mongoose.model('Season'),
	util = require('util');

var apiList = ['allocine'],
	showTypeList = ['tvseries', 'movie', 'theater', 'news', 'video'];

/**
 * Base Show Schema
 */

function BaseShowSchema() {
	Schema.apply(this, arguments);

	this.add({
		_id: Number,
		name: String,
		castMember: Object,
		catsingShort: Object,
		episodeCount: Number,
		formatTime: String,
		genre: Object,
		lastSeasonNumber: Number,
		link: Object,
		nationality: String,
		news: Object,
		originalBroadcast: Object,
		originalChannel: String,
		productionStatus: String,
		poster: String,
		seasonCount: Number,
		statistics: Object,
		synopsis: Object,
		synopsisShort: Object,
		title: String,
		trivia: Object,
		yearEnd: String,
		yearStart: String,
		api: {
			type: String,
			default: apiList[0]
		},
		seasons: [{
			type: Number,
			ref: 'Season'
		}],

		subscribers: [{
			type: Schema.ObjectId,
			ref: 'User'
		}],
		type: {
			type: String,
			default: showTypeList[0]
		}
	});
}

util.inherits(BaseShowSchema, Schema);

var ShowSchema = new BaseShowSchema();

ShowSchema.methods.createSeasons = function(model, seasons) {
	var res = [];
	if (seasons) {
		for (var i = 0; i < seasons.length; i++) {
			var data = seasons[i];
			var season = new Season();
			season._id = data.code;
			season.episodeCount = data.episodeCount;
			season.productionStatus = data.productionStatus ? data.productionStatus.value : '';
			season.yearEnd = data.yearEnd;
			season.seasonNumber = data.seasonNumber;
			season.yearStart = data.yearStart;
			season.showId = model._id;
			season.save();

			model.seasons.push(season._id);
			res.push(season);
		};
	}
	return res;
};

ShowSchema.methods.updateFromApi = function(api, data) {
	switch (api) {
		case apiList[0]:
			{
				this.castMember = data.castMember ? data.castMember : {};
				this.castingShort = data.castingShort;
				this._id = data.code;
				this.episodeCount = data.episodeCount;
				this.formatTime = data.formatTime;
				this.genre = data.genre;
				this.lastSeasonNumber = data.lastSeasonNumber;
				this.link = data.link;
				this.nationality = data.nationality && data.nationality.length > 0 ? data.nationality[0].value : "";
				this.name = data.originalTitle;
				this.news = data.news;
				this.originalBroadcast = data.originalBroadcast;
				this.originalChannel = data.originalChannel;
				this.productionStatus = data.productionStatus ? data.productionStatus.value : '';
				this.poster = data.poster ? data.poster.href : '';
				this.seasonCount = data.seasonCount;
				this.statistics = data.statistics;
				this.synopsis = data.synopsis;
				this.synopsisShort = data.synopsisShort;
				this.title = data.title;
				this.trivia = data.trivia;
				this.yearEnd = data.yearEnd;
				this.yearStart = data.yearStart;
			}
			break;
		default:
			break;
	}

	this.api = api;
};

var ThetvdbShowSchema = new BaseShowSchema({
	api: {
		type: String,
		default: 'thetvdb'
	}
});

var AllocineShowSchema = new BaseShowSchema({
	api: {
		type: String,
		default: 'allocine'
	}
});

var Show = mongoose.model('Show', ShowSchema); // our base model   
var ThetvdbShow = Show.discriminator('ThetvdbShow', ThetvdbShowSchema); // our derived model (see discriminator)
var AllocineShow = Show.discriminator('AllocineShow', AllocineShowSchema); // our derived model (see discriminator)