/*
 * Geolocation polyfill for webOS applications
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
		support = { timeout: false };

	// WebOS polyfill
	// details: http://developer.palm.com/index.php?option=com_content&view=article&id=1673
	if ( 'Mojo' in window ) {
		geoloc.getCurrentPosition = function( successCb, errorCb, options ) {
			// WebOS offers the possibility to switch between GPS and Google Services based geolocation
			// As getting the first position from GPS can be rather slow, only use it when enableHighAccuracy is true.
			if ( options.enableHighAccuracy ) {
				options.accuracy = 1;
				options.responseTime = 3;
			} else {
				options.accuracy = 3;
				options.responseTime = 1;
			}

			var request = new Mojo.Service.Request('palm://com.palm.location', {
					method: 'getCurrentPosition',
					parameters: options,
					onSuccess: function( data ) {
						data.coords = {
							latitude: data.latitude,
							longitude: data.longitude,
							heading: data.heading
						};
						successCb(data);
					},
					onFailure: function( e ) {
						switch ( e.errorCode ) {
							case 1:
								e.code = 3;
								e.message = "Timeout";
								break;
							case 2:
								e.code = 2;
								e.message = "Position unavailable";
								break;
							default:
								e.code = 0;
								message = "Unknown Error: WebOS-code " + e.errorCode;
						}
						errorCb(e);
					}
				});
		}
	}

	// implement watchPosition and clearWatch when missing
	if ( !('watchPosition' in geoloc) ) {
		var watched = [],
			watchInterval;
		geoloc.watchPosition = function( successCb, errorCb, options ) {
			// we want only one interval to watch the position
			if ( !watched.length ) {
				watchInterval = setInterval(function() {
					geoloc.getCurrentPosition( function(data) {
						// only fire the callback if the position has changed
						if ( data.coords.latitude != currentPosition.coords.latitude || data.coords.longitude != currentPosition.coords.longitude ) {
							var i = watched.length;
							while ( i-- ) {
								watched[i].success( data );
							}
						}
					}, function( error ) {
						var i = watched.length;
						while ( i-- ) {
							watched[i].err( error );
						}
					}, options );
				}, options && options.maximumAge || 3E4);
			}
			var watch = {
				success: successCb,
				err: errorCb
			};
			watched.push(watch);
			return watch;
		};
		geoloc.clearWatch = function( watch ) {
			var i = watched.length;
			while ( i-- ) {
				if ( watched[i] === watch ) {
					watched = watched.splice(i, 1);
					continue;
				}
			}
			if ( !watched.length && watchInterval ) {
				clearInterval(watchInterval);
			}
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

})(window, ( navigator || ( navigator = {geolocation: {}} ) ) && navigator.geolocation );