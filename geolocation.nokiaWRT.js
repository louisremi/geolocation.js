/*
 * Geolocation polyfill for Nokia Web Run-Time applications
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

	// Nokia polyfill
	// details: http://library.forum.nokia.com/index.jsp?topic=/Web_Developers_Library/GUID-53CE4DE6-F065-4339-8C18-5C30A9540053.html
	if ( 'device' in window && 'getServiceObject' in window.device ) {
		var so = device.getServiceObject("Service.Location", "ILocation");
		geoloc.getCurrentPosition = function( successCb, errorCb, options ) {
			so.ILocation.GetLocation({
				LocationInformationClass: "BasicLocationInformation"
			}, function( transId, eventCode, data ) {
				if ( eventCode === 4 ) {
					data.code = 2;
					data.message = "Position unavailable";
					errorCb(data);
				} else {
					var rv = data.ReturnValue;
					data.coords = {
						latitude: rv.Latitude,
						longitude: rv.Longitude,
						altitude: rv.Altitude,
						heading: rv.Heading
					};
					successCb(data);
				}
			});
		};
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