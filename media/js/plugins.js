Ext.namespace( 'Seiho.mm.plugins' );

Seiho.mm.plugins.Director = function( config ) {
	Ext.apply( this, config );
};

Ext.extend( Seiho.mm.plugins.Director, Ext.util.Observable, {

	init: function( canvas ) {
		this.canvas = canvas;

		Ext.apply( canvas, {
			registerElement  : canvas.registerElement.createSequence( this.reBackWindow, this ),
			unregisterElement: canvas.unregisterElement.createSequence( this.reBackWindow, this )
		});
	},
	
	reBackWindow: function( el ) {
		( function() { this.setRootPosition() } ).defer( 1, this );
		// ..
		el.on( 'resize', this.setRootPosition, this )
	},

	setRootPosition: function() {
		this.setPosition( this.canvas.registry.get( 0 ) );
	},
	setPosition: function( el ) {
		var xy = el.getPosition( true ), x = xy[0], y = xy[1], w = el.getWidth(), h = el.getHeight(), conn = el.connections;
		// ..
		if( conn ) {
			var th = 0, mw = 0;
			conn.each( function( it ) {
				if( it.getWidth() > mw ) mw = it.getWidth();
				th += it.getHeight();
			});
			
			var m  = Math.ceil( th / 2 );
			var n  = Math.ceil( h / 2 );
			var sy = m > y + n ? 10 : y + n - m; 
			
			conn.each( function( it ) {
				it.setPosition( x + w + 50 + Math.ceil( mw / 2 ) - Math.ceil( it.getWidth() / 2 ), sy );
				this.setPosition( it );
				sy += it.getHeight() + 10;
			}, this );
		}
	}
});

// vim: fdm=marker ts=4 sw=4 sts=4
