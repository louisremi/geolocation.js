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
		support = {	timeout: false },
		defaultMaxAge = 3E4;

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
			}, options && options.maximumAge || defaultMaxAge);
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

})(window, ( navigator || ( navigator = {geolocation: {}} ) ) && navigator.geolocation );