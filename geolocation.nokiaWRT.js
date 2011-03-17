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
		support = {	timeout: false },
		defaultMaxAge = 3E4;

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