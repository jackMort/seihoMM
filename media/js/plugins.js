Ext.namespace( 'Seiho.mm.plugins' );

Seiho.mm.plugins.Director = function( config ) {
	Ext.apply( this, config );
};

Ext.extend( Seiho.mm.plugins.Director, Ext.util.Observable, {

	init: function( canvas ) {
		console.log( canvas );
		// ...
		canvas.on( 'install', this.reBackWindow, this );
		canvas.on( 'install', this.reBackWindow, this );
	},
	
	reBackWindow: function( c, el ) {
		// FIXME only if window ...
		//if( el.isWindow ) {
			c.registry.each( function( e ) {
				console.log( e.x );
			});
		//}
	}
});

// vim: fdm=marker ts=4 sw=4 sts=4
