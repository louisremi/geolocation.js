/*
 * Geolocation polyfill
 * 
 * inspired from other geolocation polyfills
 * 
 * author: @louis_remi
 * 
 * license: MIT
 */
(function( window, geolocation, undefined ) {

if ( !geolocation ) {
	var geoloc = {},
		support = {	timeout: false },
		defaultMaxAge = 3E4;
	// blackberry polyfill, not really usable before 4.6 (callback had to be a string...)
	// details: http://docs.blackberry.com/en/developers/deliverables/11944/CS_Using_the_Location_API_using_JavaScript_898722_11.jsp
	if ( 'blackberry' in window && 'location' in window.blackberry && 'GPSSupported' in window.blackberry.location && parseFloat( navigator.appVersion ) >= 4.6 ) {
		var blocation = blackberry.location,
			watched = [];
		blocation.setAidMode(options.enableHighAccuracy ? 2 : 1);
		geoloc = {
			// blackberry has onLocationUpdate, but it has to be tweaked to handle multiple listeners
			watchPosition: function( successCb ) {
				if ( !watched.length ) {
					blocation.onLocationUpdate(function() {
						var i = 0,
							l = watched.length,
							timestamp = new Date(blocation.timestamp);
						while( i++ < l ) {
							watched[i].call(this , {
								timestamp: timestamp,
								coords: {
									latitude: blocation.latitude,
									longitude: blocation.longitude
								}
							});
						}
					});
				}
				watched.push(successCb);
				return successCb;
			},
			// blackberry 4.6 has removeLocationUpdate()
			clearWatch: function( watch ) {
				var i = watched.length;
				while ( i-- ) {
					if ( watched[i] === watch ) {
						watched = watched.splice(i, 1);
						continue;
					}
				}
				if ( !watched.length ) {
					blocation.removeLocationUpdate();
				}
			},
			// blackberry has refreshLocation but it doesn't take any callback
			getCurrentPosition: function( successCb ) {
				// create a disposable watchPosition
				var temp = geoloc.watchPosition(function(data) {
					geoloc.clearWatch(temp);
					successCb( data );
				}); 
			}
		};

	// Google gears polyfill, used on Android devices
	// always after blackberry feature test, see http://code.google.com/p/geo-location-javascript/issues/detail?id=14
	} else if ( 'google' in window && 'gears' in window.google ) {
		geoloc = google.gears.factory.create('beta.geolocation');
		support.timeout = true;

	// fallback to google geolocation
	} else {
		var currentPosition = {};
		geoloc.getCurrentPosition = function( successCb, errorCb, options ) {
			var script = document.createElement('script'),
				cbId = 'cb' + (Math.random() * 1E4 |0),
				// A special timeout implementation is required, as cleanup should always happen
				responseTimeout = setTimeout(function() {
					window[cbId](true);
				}, options.timeout || 5000);
			script.src = "http//www.google.com/jsapi?callback=" + cbId;
			window[cbId] = function( timeout ) {
				var location = google.loader.ClientLocation,
					address = location.address;
				timeout ?
					errorCb():
					successCb(currentPosition = {
						coords: {
							latitude: location.latitude,
							longitude: location.longitude
						},
						address: {
							city: address.city,
							county: address.region,
							country: address.country,
							countryCode: address.country_code
						}
					});
				// cleanup
				delete window[cbId];
				window.body.removeChild(script);
				if ( responseTimeout ) {
					clearTimeout( responseTimeout );
					responseTimeout = null;
				}
			}
			window.body.appendChild(script);
		};
		support.timeout = true;
	}
	// implement watchPosition and clearWatch when missing
	// TODO: should use a single interval, just like blackberry polyfill
	if ( !('watchPosition' in geoloc) ) {
		geoloc.watchPosition = function( successCb, errorCb, options ) {
			// poll currentPosition on a regular basis
			return setInterval(function() {
				geoloc.getCurrentPosition( function(data) {
					// only fire the callback if the position has changed
					if ( data.coords.latitude != currentPosition.coords.latitude || data.coords.longitude != currentPosition.coords.longitude ) {
						successCb( data );
					}
				}, errorCb, options );
			}, options.maximumAge || defaultMaxAge);
		};
		geoloc.clearWatch = function( watch ) {
			clearInterval( watch );
		}
	}
	// implement timeout option
	if ( !support.timeout ) {
		geoloc._getCurrentPosition = geoloc.getCurrentPosition;
		geoloc.getCurrentPosition = function( successCb, errorCb, options ) {
			var canceled,
				locationTimeout;
			geoloc._getCurrentPosition(function(data) {
				if (! canceled ) {
					successCb.call(this, data);
				}
			});
			if ( 'timeout' in options ) {
				locationTimeout = setTimeout(function() {
					errorCb({
						code: 3,
						message: "Timeout"
					});
					canceled = true;
				}, options.timeout);
			}
		}
	}
	geolocation = geoloc;
}

})(window, navigator.geolocation );