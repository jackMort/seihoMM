/**
 * plugins.js
 * Copyright (C) 2010  lech.twarog@gmail.com
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.namespace( 'Seiho.mm.plugins' );

Seiho.mm.plugins.Director = function( config ) {
	Ext.apply( this, config );
};

Ext.extend( Seiho.mm.plugins.Director, Ext.util.Observable, {
	widtbPrefix : 50,
	heightPrefix: 10,
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
		var xy = el.getPosition( true ), x = xy[0], y = xy[1], w = el.getWidth(), h = el.getHeight(), conn = el.connections, cminw = el.cminw || 0, cminh = el.cminh || 0;
		// ..
		if( conn ) {
			var th = 0, mw = 0;
			conn.each( function( it ) {
				if( it.getWidth() > mw ) mw = it.getWidth();
				th += it.getHeight();
			}, this );
			
			var m   = Math.ceil( th / 2 );
			var n   = Math.ceil( h / 2 );
			var sy  = m > y + n ? 10 : y + n - m; 
			var add = 0;

			conn.each( function( it ) {
				this.setPosition( it );
				var xxx = 0;
				if( it.cminh ) {
					add += it.cminh;					
					//xxx = Math.ceil( it.cminh/ 2 ) - Math.ceil( it.getHeight() / 2 ) ;
					//sy += xxx;
				}
				// ..
				it.setPosition( x + w + this.widtbPrefix + Math.ceil( mw / 2 ) - Math.ceil( it.getWidth() / 2 ), sy );								
				sy += it.getHeight() + xxx;
			}, this );

			el.cminh = add + ( th > h ? th : 0 );
			el.setTitle( el.cminh );
		}
	}
});

/**
 * Plugin to connect canvas with comet server
 */

var CommetActions = {
	NAME_CHANGED: 0,
	CLOSED      : 1,
	OPENED      : 2,
	// ..
	EL_ADDED    : 3,
	EL_REMOVED  : 4,
	EL_RESIZED  : 5,
	EL_MODIFIED : 6
};

Seiho.mm.plugins.Comet = function( config ) {
	Ext.apply( this, config );
};
Ext.extend( Seiho.mm.plugins.Comet, Ext.util.Observable, {
	cometServer: 'http://localhost:8800/cometd/',		
	init: function( canvas ) {				
		this.canvasChannel = '/canvas/' + canvas.name;

		dojox.comet.init( this.cometServer );
		dojox.comet.subscribe( this.canvasChannel, this.onCanvasAction.createDelegate( this ) );
		
		this.canvas = canvas;
		Ext.apply( canvas, {
			registerElement  : canvas.registerElement.createSequence( this.registerElement, this ),
			unregisterElement: canvas.unregisterElement.createSequence( this.unregisterElement, this )
		});
	},
	registerElement: function( el ) {
		dojox.comet.publish( this.canvasChannel, { type: CometActions.EL_ADDED, el: el } );
		// ..
		el.on( 'resize', this.onElResize, this );
	},
	unregisterElement: function( el ) {
		dojox.comet.publish( this.canvasChannel, { type: CometActions.EL_REMOVED, el: el } );
	},
	onCanvasAction: function( m ) {
		switch( m.type ) {
			case CometActions.EL_ADDED  : this.addElement( el );  break;
			case CometActions.EL_REMOVED: this.removeElement( el );  break;
		
			default: Logger.log( m.type )
		}
	},
	// private
	onElResize: function() {
		dojox.comet.publish( this.canvasChannel, 'TODO :/' );
	},
	addElement: function( el ) {
		Logger.log( "addElement: " + el );
	},
	removeElement: function( el ) {
		Logger.log( "removeElement: " + el );
	}
});


// vim: fdm=marker ts=4 sw=4 sts=4
