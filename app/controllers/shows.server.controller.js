'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Show = mongoose.model('Show'),
	Season = mongoose.model('Season'),
	Episode = mongoose.model('Episode'),
	ThetvdbShow = mongoose.model('ThetvdbShow'),
	AllocineShow = mongoose.model('AllocineShow'),
	async = require('async'),
	request = require('request'),
	allocine = require('allocine-api'),
	_ = require('lodash');

var JSONS = require('json-serialize');

var limit = 50;
var json;


/**
 * Search a Show
 */

exports.search = function(req, res) {
	var show, query, filter;

	query = req.query.query;
	filter = req.query.filter;

	if (!query) {
		return res.send(404, {
			message: 'Name should not be empty.'
		});
	}

	var seriesName = query
		.toLowerCase()
		.replace(/ /g, '_')
		.replace(/[^\w-]+/g, '');
	async.waterfall(
		[
			function(callback) {
				// Recherche de tous les films spiderman
				allocine.api('search', {
					q: seriesName,
					filter: filter,
					count: limit
				}, function(error, results) {
					if (error) {
						return res.send(404, {
							message: req.body.name + ' was not found.'
						});
					} else {
						callback(error, results.feed);
					}
				});
			},
			function(data, callback) {
				var shows = [];
				_.each(data.tvseries, function(serie) {
					show = new AllocineShow();
					show.updateFromApi('allocine', serie);
					shows.push(show);
				});
				return res.status(200).send({
					result: shows
				});

			}
		],
		function(err, show) {

		}
	);
};


/**
 * Show the current Show
 */
exports.read = function(req, res) {
	console.log("read");
	res.jsonp(req.show);
};

/**
 * Subscribe to a Show
 */
exports.subscribe = function(req, res) {
	Show.findById(req.show.id).exec(function(err, show) {
		if (err || !show)
			return res.status(400).send({
				message: 'Failed to load Show ' + req.show.id
			});
		if (show.subscribers.indexOf(req.user.id) === -1) {
			show.subscribers.push(req.user.id);
			show.save(function(err) {
				if (err) return res.status(400).send({
					message: 'Failed to save Show ' + req.show.id
				});
				res.jsonp(show);
			});
		} else {
			return res.status(400).send({
				message: 'You are already subscribed'
			});
		}

	});
};

/**
 * UnSubscribe to a Show
 */
exports.unsubscribe = function(req, res) {
	Show.findById(req.show.id).exec(function(err, show) {
		if (err || !show)
			return res.status(400).send({
				message: 'Failed to load Show ' + req.show.id
			});
		var index = show.subscribers.indexOf(req.user.id);
		if (index !== -1) {
			show.subscribers.splice(index, 1);
			show.save(function(err) {
				if (err) return res.status(400).send({
					message: 'Failed to save Show ' + req.show.id
				});
				res.jsonp(show);
			});
		} else {
			return res.status(400).send({
				message: 'You are not subscribed'
			});
		}

	});
};

/**
 * List of Shows
 */
exports.list = function(req, res) {

	Show.find().sort('-created').populate('user', 'displayName').exec(function(err, shows) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shows);
		}
	});
};


var getDataFromAllocineByCodeId = function(type, id, callback, next) {
	allocine.api(type, {
		code: id
	}, function(error, results) {
		if (error) {
			return next(new Error('Data ' + id));
		} else {
			callback(error, results);
		}
	});
};

var callNext = function(show, req, res, next, err) {
	if (err) {
		if (err.code === 11000) {
			return res.send(409, {
				message: show.name + ' already exists.'
			});
		}
	}
	req.show = show;
	next();
};

/**
 * Show middleware
 */

exports.showByID = function(req, res, next, id) {
	//recherche dans la BDD
	console.log("showbyid");

	Show.findById(id).populate('seasons').exec(function(err, show) {

		if (err) {
			return next(err);
		}

		if (!show) {
			async.waterfall(
				[
					//recuperation de allocine
					function(callback) {
						getDataFromAllocineByCodeId('tvseries', id, callback, next)
					},
					function(data, callback) {
						var newShow = new AllocineShow();
						newShow.updateFromApi('allocine', data.tvseries);
						var seasons = newShow.createSeasons(newShow, data.tvseries.season);
						json = JSONS.serialize(newShow);
						json.seasons = seasons;
						callback(null, newShow);
					}
				],
				function(err, data) {
					show = data;
					show.save();
					callNext(json, req, res, next, err);
				}
			);
		} else {
			callNext(show, req, res, next);
		}
	});
};

exports.getEpisodes = function(req, res, next) {
	var seasonId = req.params.id;

	Season.findById(seasonId).populate('episodes').exec(function(err, season) {
		if (err) {
			return next(err);
		}
		async.waterfall(
			[
				//recuperation de allocine
				function(callback) {
					getDataFromAllocineByCodeId('season', seasonId, callback, next)
				},
				function(data, callback) {
					var episodes = season.createEpisodes(season, data.season.episode);
					callback(null, episodes);
				}
			],
			function(err, data) {
				json = JSONS.serialize(season);
				json.episodes = data;
				season.save(function(err) {
					season.episodes = data;
					res.jsonp({
						result: json
					});

				});
			}
		);
	});
};

exports.updateEpisode = function(req, res, next) {
	console.log(req.params);
	var episodeId = req.params.id;
	Episode.findById(episodeId).exec(function(err, episode) {
		if (err) {
			return next(err);
		}
		async.waterfall(
			[
				function(callback) {
					callback(null, null);
				}
			],
			function(err, data) {

			}
		);
	});
};