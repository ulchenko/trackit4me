'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
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
		castMember:Object,
		castingShort: Object,
		episodeCount:Number,
		formatTime: String,
		genre :Object,
		lastSeasonNumber:Number,
		link:Object,
		nationality :String,
		news : Object,
		originalBroadcast : Object,
		originalChannel :String,
		productionStatus :  Object,
		poster : String,
		season: Object,
		seasonCount : Number,
		statistics : Object,
		synopsis : Object,
		synopsisShort : Object,
		title : String,
		trivia : Object,
		yearEnd : String,
		yearStart : String,
		api: {type : String, default: apiList[0]},

		subscribers: [{
			type: Schema.ObjectId, ref: 'User'
		}],
		type: {type : String, default: showTypeList[0]}
	});                                     
}                                         

util.inherits(BaseShowSchema, Schema);

var ShowSchema = new BaseShowSchema();

var cleanJson = function (data) {
	var str = JSON.stringify(data);
	str = str.replace(/"\$\"/g, '\"value\"');
	return JSON.parse(str);

};


ShowSchema.methods.updateFromApi = function (api, data) {
	data = cleanJson(data);
	switch (api) {
	case apiList[0]: {
		this.castMember = data.castMember;
		this.castingShort = data.castingShort;
		this._id = data.code;
		this.episodeCount = data.episodeCount;
		this.formatTime = data.formatTime;
		this.genre = data.genre;
		this.lastSeasonNumber = data.lastSeasonNumber;
		this.link = data.link;
		this.nationality = data.nationality && data.nationality.length > 0 ? data.nationality[0].value : "";
		this.name= data.originalTitle;
		this.news = data.news;
		this.originalBroadcast = data.originalBroadcast;
		this.originalChannel = data.originalChannel;
		this.productionStatus = data.productionStatus;
		this.poster= data.poster ? data.poster.href : '';
		this.season = data.season;
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

var getSeasonById = function (list, seasonId) {
	for (var i = 0; i < list.length; i++) {
		var res = list[i];
		if (res.code == seasonId)
			return res;
	}
	return null;
};

ShowSchema.methods.updateSeasonFromApi = function (seasonId, data) {
	data = cleanJson(data);
	var season = getSeasonById(this.season, seasonId);
	if (season) {
		switch (this.api) {
		case apiList[0]: {
			season.episode = data.episode;
			season.episodeCount = data.episodeCount;
			season.picture = data.picture.href;
			season.productionStatus = data.productionStatus;
			season.yearEnd = data.yearEnd;
			season.yearStart = data.yearStart;
		}
		break;
		default:
			break;
		}

	}
};


ShowSchema.methods.hasSeasons = function () {

	switch (this.api) {
	case apiList[0]: {
		return this.season != null && this.season != undefined;
	}
	break;
	break;
	default:
		return false;
	break;
	}
};

var ThetvdbShowSchema = new BaseShowSchema({    
	api: {type : String, default: 'thetvdb'}                           
});  

var AllocineShowSchema = new BaseShowSchema({    
	api: {type : String, default: 'allocine'}                           
});  

var Show = mongoose.model('Show', ShowSchema); // our base model   
var ThetvdbShow = Show.discriminator('ThetvdbShow', ThetvdbShowSchema); // our derived model (see discriminator)
var AllocineShow = Show.discriminator('AllocineShow', AllocineShowSchema); // our derived model (see discriminator)

