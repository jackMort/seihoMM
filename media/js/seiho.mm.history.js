/**
 * seiho.mm.history.js
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

Ext.namespace( 
	'Seiho.mm.history'
);

// -------------------
Seiho.mm.history.Manager = Ext.extend( Ext.util.Observable, {//{{{
	constructor: function( config ) {//{{{
		this.undoActions = []
		this.redoActions = []
        // ..
        this.addEvents(
            'change'    
        )

		Ext.apply( this, config || {} );
		Seiho.mm.history.Manager.superclass.constructor.call( config )
	},
	//}}}
	canUndo: function() {//{{{
		return this.undoActions.length > 0
	},
	//}}}
	canRedo: function() {//{{{
		return this.redoActions.length > 0
	},
	//}}}
	undo: function() {//{{{
		if( !this.canUndo() ) return false;
		//..
		var lastIdx = this.undoActions.length - 1, action = this.undoActions[lastIdx];
		
		action.undo();
		this.undoActions.splice( lastIdx, 1 );
		this.redoActions.push( action );
        this.fireEvent( 'change', this )
	},
	//}}}
	redo: function() {//{{{
		if( !this.canRedo() ) return false;
		//..
		var lastIdx = this.redoActions.length - 1, action = this.redoActions[lastIdx];
		
		action.redo();
		this.redoActions.splice( lastIdx, 1 );
		this.undoActions.push( action );
        this.fireEvent( 'change', this )
	},
	//}}}
	put: function( action ) {//{{{
		this.redoActions = [];
        this.undoActions.push( action )
        this.fireEvent( 'change', this )
    },
    //}}}
	all: function() {//{{{
		return {
			undo: this.undoActions,
			redo: this.redoActions
		}
    }
    //}}}
});
//}}}
Seiho.mm.history.Action = Ext.extend( Ext.util.Observable, {//{{{
	name: null,
	constructor: function( config ) {//{{{
		Ext.apply( this, config || {} );
		Seiho.mm.history.Action.superclass.constructor.call( config )
	},
	//}}}
	redo: function() {//{{{
		Seiho.Logger.log( 'redo' )
	},
	//}}}
	undo: function() {//{{{
		Seiho.Logger.log( 'undo' )
	}
	//}}}
})
//}}}
// vim: fdm=marker ai ts=4 sw=4 sts=4 et
