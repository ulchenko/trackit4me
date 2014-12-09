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
    	name: String,
    	airsDayOfWeek: String,
    	airsTime: String,
    	firstAired: Date,
    	genre: [String],
    	network: String,
    	overview: String,
    	rating: Number,
    	ratingCount: Number,
    	status: String,
    	poster: String,
    	subscribers: [{
    		type: Schema.ObjectId, ref: 'User'
    	}],
    	episodes: [{
    		season: Number,
    		episodeNumber: Number,
    		episodeName: String,
    		firstAired: Date,
    		overview: String
    	}]
    });                                     
}                                         
                                            
util.inherits(BaseShowSchema, Schema);

var ShowSchema = new BaseShowSchema();


ShowSchema.methods.updateFromApi = function (api, data) {
	this._id= data.id;
	this.name= data.seriesname;
	this.airsDayOfWeek= data.airs_dayofweek;
	this.airsTime= data.airs_time;
	this.firstAired= data.firstaired;
	this.genre= data.genre.split('|').filter(Boolean);
	this.network= data.network;
	this.overview= data.overview;
	this.rating= data.rating;
	this.ratingCount= data.ratingcount;
	this.runtime= data.runtime;
	this.status= data.status;
	this.poster= data.poster;
	this.episodes= [];
};

var ThetvdbShowSchema = new BaseShowSchema({    
    api: {type : String, default: 'thetvdb'}                           
});  


var Show = mongoose.model('Show', ShowSchema); // our base model   
var ThetvdbShow = Show.discriminator('ThetvdbShow', ThetvdbShowSchema); // our derived model (see discriminator)

