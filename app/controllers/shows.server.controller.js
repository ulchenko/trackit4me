'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('./errors.server.controller'),
Show = mongoose.model('Show'),
ThetvdbShow = mongoose.model('ThetvdbShow'),
async = require('async'),
request = require('request'),
xml2js = require('xml2js'),
_ = require('lodash');



/**
 * Create a Show
 */
exports.create = function(req, res) {
	var show, seriesId;
	var apiKey = 'E28F2EE8D688E1B2';
	var parser = xml2js.Parser({
		explicitArray: false,
		normalizeTags: true
	});
	if (!req.body.name) {
		return res.send(404, { message: 'Name should not be empty.' });
	}
	var seriesName = req.body.name
	.toLowerCase()
	.replace(/ /g, '_')
	.replace(/[^\w-]+/g, '');

	async.waterfall(
			[
			 function(callback) {
				 request.get('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, function(error, response, body) {
					 parser.parseString(body, function(err, result) {
						 if (!result.data.series) {
							 return res.send(404, { message: req.body.name + ' was not found.' });
						 }
						 seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
						 callback(err, seriesId);
					 });
				 });
			 },
			 function(seriesId, callback) {
				 request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function(error, response, body) {
					 parser.parseString(body, function(err, result) {
						 var series = result.data.series;
						 var episodes = result.data.episode;
						 console.log(series.id);
						 show = new ThetvdbShow({});
						 show.updateFromApi('thetvdb', series);
						 _.each(episodes, function(episode) {
							 show.episodes.push({
								 season: episode.seasonnumber,
								 episodeNumber: episode.episodenumber,
								 episodeName: episode.episodename,
								 firstAired: episode.firstaired,
								 overview: episode.overview
							 });
						 });
						 callback(err, show);
					 });
				 });
			 },
			 function(show, callback) {
				 var url = 'http://thetvdb.com/banners/' + show.poster;
				 request({ url: url, encoding: null }, function(error, response, body) {
					 show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
					 callback(error, show);
				 });
			 }
			 ],
			function(err, show) {
				show.save(function(err) {
					if (err) {
						if (err.code === 11000) {
							return res.send(409, { message: show.name + ' already exists.' });
						}
					}
					res.send(200);
				});
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
	var show = req.show ;
	show = _.extend(show , req.body);

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
			return res.status(400).send({message: 'Failed to load Show ' + req.show.id});
		if (show.subscribers.indexOf(req.user.id) === -1) {
			show.subscribers.push(req.user.id);
			console.log(show.subscribers);
			show.save(function(err) {
				if (err) return res.status(400).send({message: 'Failed to save Show ' + req.show.id});
				res.jsonp(show);
			});		
		}
		else {
			return res.status(400).send({message: 'You are already subscribed'});
		}
	
	});
};

/**
 * UnSubscribe to a Show
 */
exports.unsubscribe = function(req, res) {
	Show.findById(req.show.id).exec(function(err, show) {
		if (err || !show) 
			return res.status(400).send({message: 'Failed to load Show ' + req.show.id});
		var index = show.subscribers.indexOf(req.user.id); 
		if (index !== -1) {
			show.subscribers.splice(index,1);
			show.save(function(err) {
				if (err) return res.status(400).send({message: 'Failed to save Show ' + req.show.id});
				res.jsonp(show);
			});		
		}
		else {
			return res.status(400).send({message: 'You are not subscribed'});
		}
	
	});
};


/**
 * Delete an Show
 */
exports.delete = function(req, res) {
	var show = req.show ;

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

/**
 * Show middleware
 */
exports.showByID = function(req, res, next, id) { 
	Show.findById(id).populate('user', 'displayName').exec(function(err, show) {
		if (err) return next(err);
		if (! show) return next(new Error('Failed to load Show ' + id));
		req.show = show ;
		next();
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
