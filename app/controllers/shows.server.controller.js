'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Show = mongoose.model('Show'),
	ThetvdbShow = mongoose.model('ThetvdbShow'),
	AllocineShow = mongoose.model('AllocineShow'),
	async = require('async'),
	request = require('request'),
	xml2js = require('xml2js'),
	allocine = require('allocine-api'),
	_ = require('lodash');

var parser = xml2js.Parser({
	explicitArray: false,
	normalizeTags: true
});

var limit = 50;


/**
 * Create a Show
 */
exports.create = function(req, res) {

	return res.status(200).send({
		message: 'TODO'
	});
};

exports.search = function(req, res) {
	var show, query, filter;

	query = req.query.query;
	filter = req.query.filter;


	if (!query) {
		console.log("aaaaaaaaaaaaaaaaaaaaa", req.query);
		return res.send(404, {
			message: 'Name should not be empty.'
		});
	}

	var seriesName = query
		.toLowerCase()
		.replace(/ /g, '_')
		.replace(/[^\w-]+/g, '');
	console.log(seriesName);
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
						console.log('Error : ' + error);
						return res.send(404, {
							message: req.body.name + ' was not found.'
						});
					} else {
						console.log('Success !');
						//console.log(results.feed);
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
	res.jsonp(req.show);
};

/**
 * Update a Show
 */
exports.update = function(req, res) {
	var show = req.show;
	show = _.extend(show, req.body);

	show.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(show);
		}
	});
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
			console.log(show.subscribers);
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
 * Delete an Show
 */
exports.delete = function(req, res) {
	var show = req.show;

	show.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(show);
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
			console.log('Error : ' + error);
			return next(new Error('Data ' + id));
		} else {
			callback(error, results);
		}
	});
};

var callNext = function(show, req, res, next, err) {
	if (err) {
		console.log(err);
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
	Show.findById(id).populate('user', 'displayName').exec(function(err, show) {
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
						callback(null, newShow);
					}
				],
				function(err, data) {
					show = data;
					console.log("save");
					show.save(function(err) {
						callNext(show, req, res, next, err);
					});
				}
			);
		} else {
			callNext(show, req, res, next)
		}
	});
};

exports.getepisodes = function(req, res, next) {
	var seasonId = req.query.seasonId;
	var showId = req.query.showId;

	Show.findById(showId).exec(function(err, show) {
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
					show.updateSeasonFromApi(seasonId, data.season);
					callback(null, show);
				}
			],
			function(err, data) {
				show = data;
				console.log("update");
				show.update(function(err) {
					res.jsonp(show);
				});
			}
		);
	});

};



/**
 * Show authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.show.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};