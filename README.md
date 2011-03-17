Geolocation.js
==============

geolocation.js is a polyfill providing a normalized W3C geolocation API across browsers.

Basic usage
-----------

Accessing the position of the device should be as simple as:

    navigator.geolocation.getCurrentPosition(
    	// callback executed when the position was successfully retrieved
    	function( position ) {
				...
	    },
	    // callback executed in case of error
    	function( error ) {
    		...
    	},
    	// options
    	{ timeout: 30000 }
    );

The `position` parameter of the success callback has at least the following properties:

    position.coords.latitude;
    position.coords.longitude;

The `error` parameter of the error callback has at least the following properties:

    error.code;
    error.message;

Advanced usage
--------------

A more detailed documentation of the geolocation API can be found on [Mozilla Developer Network](https://developer.mozilla.org/en/Using_geolocation)

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

Additional scripts are provided for Nokia Web Run-Time and Palm webOS normalization.