Geolocation.js
==============

geolocation.js is a polyfill providing a normalized W3C geolocation API across browsers.

Basic usage
-----------

Accessing the position of the device should be as simple as:

    navigator.geolocation.getCurrentPosition(
    	// code executed when the position was successfully retrieved
    	function( position ) {
    		// position has at least the following attributes:
	    	position.coords.latitude;
	    	position.coords.longitude;
	    },
	    // code executed in case of error
    	function( error ) {
    		// error has at least the following attributes:
    		error.code;
    		error.message;
    	},
    	// options
    	{ timeout: 30000 }
    );

Compatibility
-------------

The native geolocation capabilities of the following browsers and mobile browsers should be supported:

- IE9+
- Firefox 3.5+
- Chrome
- Safari 4+
- Apple iOS 3+
- Android
- Windows Mobile with Google Gears
- Maemo with Geolocation package
- Meego
- Blackberry OS 4.6+

An IP based (less accurate) fallback is provided for browsers not supporting native geolocation.

Additional scripts are provided for Nokia Web Run-Time and Palm webOS normalization