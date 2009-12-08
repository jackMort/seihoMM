Ext.namespace( 'Seiho.Logger' );

Seiho.Logger = function() {
	
	var logFn = Ext.isAir ? trace : ( window.console ?  console.log : alert );

	return {
		log: function( message) {
			logFn( message );
		}
	}
}();
// vim: fdm=marker ts=4 sw=4 sts=4
