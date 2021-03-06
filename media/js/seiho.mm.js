/**
 * seiho.mm.js
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
	'Seiho.mm',
	'Seiho.mm.element' 
);

// -------------------
Ext.override(Ext.Element, {
// Call the passed function on the current Element, and all its descendants
    cascade: function(fn, scope, args) {
        if(fn.apply(scope || this, args || [this]) !== false){
            var cs = this.dom.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
                if (cs[i].nodeType!=3) {
                    // Don't take care of "\n " textnode
                    cs[i].removeAttribute('id');
                    Ext.get(cs[i]).cascade(fn, scope, args);
                }
            }
        }
    },
    
    clone: function() {        
        var result = this.dom.cloneNode(true);
        result.id = Ext.id();
        result = Ext.get(result);
        result=result.clean(); // buggy ?? #textNode are not removed ...
        result.cascade(function(e){e.id = Ext.id();});
        return result;
    }
});
// ...................
Seiho.mm.Canvas = Ext.extend( Ext.Panel, {//{{{
	maxWidth      : 2000,
	maxHeight     : 2000,
	gridSize      : 10,
	bodyCssClass  : 'mm_canvas',
	autoScroll    : false,
	// mart that is canvas
	yeahItIsCanvas: Ext.emptyFn,
	initComponent : function() {
		// ..
		Ext.apply( this, {
			keys: 
			[
				// intall element on CTRL+ENTER
				{
					key      : Ext.EventObject.ENTER,
					ctrl     : true,
					stopEvent: true,
					fn       : this.installNewElement,
					scope    : this
				},
				// Edit title on ALT+ENTER
				{
					key      : Ext.EventObject.ENTER,
					alt      : true,
					stopEvent: true,
					fn       : this.startElementTitleEdit,
					scope    : this
				},
				{
					key      : Ext.EventObject.N,
					ctrl     : true,
					stopEvent: true,
					fn       : function() {
						WINDOW_GROUP.activateNext()
					},
					scope    : this
				},
				// move element with CTRL + LEFT, RIGHT, TOP, BOTTOM
				{
					key      : Ext.EventObject.LEFT,
					ctrl     : true,
					stopEvent: true,
					fn       : this.moveElementTo.createDelegate( this, [ 10, 0, 0, 0 ] )
				},{
					key      : Ext.EventObject.RIGHT,
					ctrl     : true,
					stopEvent: true,
					fn       : this.moveElementTo.createDelegate( this, [ 0, 10, 0, 0 ] )
				},{
					key      : Ext.EventObject.UP,
					ctrl     : true,
					stopEvent: true,
					fn       : this.moveElementTo.createDelegate( this, [ 0, 0, 10, 0 ] )
				},{
					key      : Ext.EventObject.DOWN,
					ctrl     : true,
					stopEvent: true,
					fn       : this.moveElementTo.createDelegate( this, [ 0, 0, 0, 10 ] )
				}
			]
		});

		// init registry
		this.registry = new Seiho.mm.Registry();
		// init history
		this.historyManager = new Seiho.mm.history.Manager();
		this.historyManager.on( 'change', function( h) {
			Seiho.Logger.log( h.all() )	
		})

		// TODO check
		//map = new Ext.KeyMap( document, this.keys_ );
		Seiho.mm.Canvas.superclass.initComponent.apply( this, arguments );
	},
	afterRender  : function() {
		Seiho.mm.Canvas.superclass.afterRender.call( this );
        //..
        var self = this;
		this.DropTarget = new Ext.dd.DropTarget( this.body, {
			ddGroup   : 'canvas',
			scope     : this,
			cb        : this.notifyDrop,
            notifyDrop: function( src, e, data ) {
                //return this.cb.call( this.scope, src, e, data );
                new data.node.type( self, { x: e.getPageX(), y: e.getPageY() } ).install();
                return true;
			}
		});

		// create Raphael svg object
		this.raphael = Raphael( this.body.id, this.maxWidth, this.maxHeight);
		// create slider
		new Ext.Slider({
			renderTo: Ext.DomHelper.append( this.getEl(), { tag: 'div', cls: 'canvas-slider' } ),
			height: 200,
			value: 5,
			minValue: 0,
			maxValue: 10,
			vertical: true,
			listeners: {
				change: this.zoomCanvas.createDelegate( this )
			}
		})
	},
	zoomCanvas: function( s, w ) {		
		var el = Ext.get( this.raphael.canvas ), steps = 10, m = -this.maxHeight, u = this.maxHeight * 2 /steps
		var v = this.maxHeight;
		switch( w ) {
			case 0: v = this.maxHeight/steps; break
			case steps/2: v = this.maxHeight; break
			default: v = u * w
		}

		var cx = [0, 0, v, v];
		el.set( { viewBox: cx.join( ' ' ) } )
	},
	moveElementTo: function() {

	},

	registerElement: function( el ) {
		return this.registry.register( el );
	},

	unregisterElement: function( el ) {
		return this.registry.unregister( el );
	},

	serialize: function() {
		var r = {
			name       : this.title,
			dateCreated: new Date().getTime(),
			// TODO get this info
			createdBy  : {
				name : 'Lech Twaróg',
				email: 'lech.twarog@gmail.com'
			},
			createdIn  : 'SeihoMindMapper',
			varsion    : '0.0.1-development-preview',
			//..
			items      : []
		};
		this.registry.each( function( e ) {
			r.items.push( e.serialize() );
		});
		return r;
	},
	getToolsProvider: function() {
		return this.toolsProvider;
	},
	installPlugin: function( plugin ) {
		var owner = this.ownerCt, plugins = this.plugins || [];
		// ..
		plugins.push( plugin );
		plugin.init( this );
	},
	removePlugin: function( plugin ) {
		var owner = this.ownerCt, plugins = this.plugins || [];
		// ..
		plugins.remove( plugin );
	},
	getSvgInnerHTML: function() {
		return Ext.get( this.raphael.canvas ).parent().dom.innerHTML                 
	}
});
//}}}
Seiho.mm.Registry = Ext.extend( Ext.util.MixedCollection, {//{{{
	register  : function( e ) {
		return this.add( e );
	},
	unregister: function( e ) {
		return this.remove( e );
	}
});
//}}}
Seiho.mm.Editor = Ext.extend( Ext.util.Observable, {//{{{
	getInlineEditor:function(){
		if( !this.inlineEd ) {
			this.inlineEd = new Ext.Editor({
				alignment      : "l-l?",
				completeOnEnter: true,
				autoSize       : "width",
				zIndex         : 60000,
				shadow         : "drop",
				shadowOffset   : 3,
				updateEl       : true,
				cls            : "x-small-editor",
				field          : {
					selectOnFocus: true
				},
				ignoreNoChange: false,
				doAutoSize    : function(){
					if(typeof this.requestedWidth=="number"){
						this.setSize(this.requestedWidth)
					}else{
						this.setSize( this.boundEl.getWidth() )
					}
				}
			});
			this.inlineEd.on( "complete", this.onEditComplete, this )
		}
		return this.inlineEd
	},
	stopEdit: function(){ 
		if( this.inlineEd && this.inlineEd.editing ){ 
			this.inlineEd.completeEdit()
		}
	},
	startEdit: function( f, e, a, c ) {
		var g = this.editData;
		if( g && g.component == f && g.el == e && g.config == a ){
			return
		}
		this.stopEdit();
		this.editData = {
			component:f,
			el:e,
			config:a
		};
		var b = this.getInlineEditor();
		b.requestedWidth = c;
		b.startEdit( e/*, a*/ )
	},
	onEditComplete: function( a, b ) {
		delete this.editData;
	}
});
//}}}

// PROTOTYPES
Seiho.mm.element.BaseElement = Ext.extend( Ext.util.Observable, {//{{{
	class: 'baseElement',
	category: 'Podstawowe',
	myConfig: [ 'category' ],	
	constructor: function( canvas, config ){//{{{
        if( !canvas || canvas == undefined ) throw "canvas must by defined ..."
		this.canvas = canvas;
        this.id = Ext.id();
		this.addEvents(
			'add',
			'remove',
			'move',
			'resize'
		);
		
		Ext.apply( this, config || {} );
		Seiho.mm.element.BaseElement.superclass.constructor.call( config )
	},
	//}}}
	install: function( noHistory ) {//{{{
		this.canvas.registerElement( this );
		// ..
		// ..
		if( !noHistory ) {
			this.canvas.historyManager.put( this.getInstallAction() );		
		}	
		this.fireEvent( 'add', this, this.canvas );		
	},
	//}}}
	uninstall: function( noHistory ) {//{{{
		this.canvas.unregisterElement( this );
		// ..
		if( !noHistory ) {
			this.canvas.historyManager.put( this.getUninstallAction() );		
		}
		this.fireEvent( 'remove', this, this.canvas );
	},
	//}}}
	serialize: function() {//{{{
		var tmp = {};
		for( var i in this.myConfig ) {
			tmp[i] = this[i]
		}
		return tmp;
	},
	//}}}
	getInstallAction: function() {//{{{
		return new Seiho.mm.history.Action( { name: 'Usunięcie elementu ' + this.text } )
	},
	//}}}
	getUninstallAction: function() {//{{{
		return new Seiho.mm.history.Action( { name: 'Usunięcie elementu ' + this.text } )
	}
	//}}}
});
//}}}

Seiho.mm.element.DD = Ext.extend( Ext.dd.DD, {
    handleMouseDown: function(e, oDD){
        if (this.primaryButtonOnly && e.button != 0) {
            return;
        }

        if (this.isLocked()) {
            return;
        }

        this.DDM.refreshCache(this.groups);

        var pt = new Ext.lib.Point(Ext.lib.Event.getPageX(e), Ext.lib.Event.getPageY(e));
        /*
        if (!this.hasOuterHandles && !this.DDM.isOverTarget(pt, this) )  {
            alert( 'dupa :' +!this.DDM.isOverTarget(pt, this) );
        } else {
        */
            if (this.clickValidator(e)) {

                // set the initial element position
                this.setStartPosition();


                this.b4MouseDown(e);
                this.onMouseDown(e);

                this.DDM.handleMouseDown(e, this);

                this.DDM.stopEvent(e);
            } else {


            }
        //}
    }, 
    /*
    startDrag: function(x, y) {
        
    },

    onDrag: function(e) {
    },

    onDragEnter: function(e, id) {
    },

    onDragOver: function(e, id) {
    },

    onDragOut: function(e, id) {
    },

    onDragDrop: function(e, id) {
    },

    endDrag: function(e) {
    }*/
});

Seiho.mm.element.Image = Ext.extend( Seiho.mm.element.BaseElement, {//{{{
    text: 'Obrazek',
    iconCls: 'icon-page_white_code',
    // ..
    src: '/media/images/hal.png',
    width: 128,
    height: 128,
    x: 200,
	y: 200,
	myConfig: [ 'category', 'text', 'src', 'width', 'height', 'x', 'y' ],
    install: function() {
        Seiho.mm.element.Window.superclass.install.apply( this, arguments )
        // ..	
		var c = this.canvas.raphael, id = this.id + '_svg';
		
        var r = this.r_image = c.image( this.src, this.x, this.y, this.width, this.height );
        var el = Ext.get( this.r_image.node );
        el.set({ id: id });
        
        var dd = new Seiho.mm.element.DD( id, 'group' )
        Ext.apply( dd, {
            onDrag: function( e ) {
                var iPageX = e.getPageX(), iPageY = e.getPageY();
                var oCoord = this.getTargetCoord(iPageX, iPageY);
                if (this.deltaSetXY) {
                    r.attr({ x: oCoord.x + this.deltaSetXY[0], y: oCoord.y + this.deltaSetXY[1] }) ;
                }
            },
            startDrag: function() {
                r.toFront();           
            }
        });
        
        /*
        Ext.get( id ).initDDProxy("proxytest", {dragElId: id + '_proxy' }, {
            afterDrag: function() {
                var element = Ext.get( this.getEl() );
                r.attr({ x : element.getLeft( true ) });
                r.attr({ y : element.getTop( true ) });
            }
        });
        */
        return this
	},
	uninstall: function() {
		Seiho.mm.element.Image.superclass.uninstall.apply( this, arguments )
		// ..
		this.r_image.remove()
	},
	getInstallAction: function() {
		var self = this;
		return new Seiho.mm.history.Action({
			name: 'Instalacja Obrazka',
			redo: function(){ new Seiho.mm.element.Image( self.canvas, self.serialize() ).install( true ) },
			undo: function(){ self.uninstall( true ) }
		})
	},
	getUninstallAction: function() {
		var self = this;
		return new Seiho.mm.history.Action({
			name: 'Deinstalacja Obrazka',
			redo: function(){ self.uninstall( true ) },
			undo: function(){ new Seiho.mm.element.Image( self.canvas, self.serialize() ).install( true ) }
		})
	}
});
//}}}
Seiho.mm.element.Window = Ext.extend( Seiho.mm.element.BaseElement, {//{{{
	text: 'Okno standardowe',
    iconCls: 'icon-page_white_code_red',
    // ..
    width        : 200,
	height       : 100,
	x            : 100,
	y            : 100,
	title        : 'Bez tytułu',
	class        : 'window',
	// .....
	install: function() {//{{{
        Seiho.mm.element.Window.superclass.install.apply( this, arguments )
		// ..	
		var w = this.width, h = this.height, x = this.x, y = this.y;
		var c = this.canvas.raphael;

		this.r_window_frame = c.rect( x + 4, y + 4, w, h, 5 ).attr({ stroke: '', fill: 'black', "fill-opacity": .2 })
		this.r_window = c.rect( x, y, w, h, 5 ).attr({ stroke: '#99bbe8', fill: '#99bbe8', "fill-opacity": 1 })
		this.r_window_body = c.rect( x + 5, y + 15, w - 10, h - 20, 3 ).attr({ stroke: '#99bbe8', fill: 'white', "fill-opacity": 1 })
		this.r_window_header = c.text( x + 35, y + 8, this.title ).attr( { 'font-family': 'tahoma, arial, helvetica', 'font-weight': 'bold', fill: 'white' })
		this.r_window_add_button = c.circle( x + w - 22, y + 8, 4 ).attr( { stroke: '', fill: 'white' } ) 
		this.r_window_remove_button = c.circle( x + w - 10, y + 8, 4 ).attr( { stroke: '', fill: '#eeeeee' } ) 

		var t = this;
		var isDrag = false;
	    var dragger = function (e) {
		    this.dx = e.clientX;
			this.dy = e.clientY;
	        isDrag = this;
			e.preventDefault && e.preventDefault();
	    };

        this.r_window_header.mousedown(dragger);
    
		document.onmousemove = function (e) {
			e = e || window.event;
			if (isDrag) {
				var cp = t.canvas.getPosition()
				var x = e.clientX - cp[0], y = e.clientY - cp[1], s = t.r_window.getBBox()				
				// ..				
				t.r_window.attr( { x: x, y: y } )	
				t.r_window_frame.attr( { x: x + 4, y: y + 4 } )
				t.r_window_body.attr( { x: x + 5, y: y + 15 } )
				t.r_window_header.attr( { x: x + 35, y: y + 8 } )
				t.r_window_add_button.attr( { cx: x + s.width - 22, cy: y + 8 } )
				t.r_window_remove_button.attr( { cx: x + s.width - 10, cy: y + 8 } )
				// ..
				this.x = x, this.y = y
				t.fireEvent( 'resize', t, x, y )
			}
		};
		 document.onmouseup = function () {
			isDrag = false;
		};

		this.r_window_add_button.click( function(e) {
			t.addWindow()
		})
	
		this.r_window_remove_button.click( ( function(e) {
			t.uninstall()
		} ).createDelegate( this ) )
		
		return this
	},
	//}}}
	uninstall: function() {//{{{
        Seiho.mm.element.Window.superclass.uninstall.apply( this, arguments )
		// ..
		this.r_window.remove()
		this.r_window_frame.remove()
		this.r_window_body.remove()
		this.r_window_header.remove()
		this.r_window_add_button.remove()
		this.r_window_remove_button.remove()
	},
	//}}}
	setSize: function( w, h ) {//{{{
		this.r_window.attr( { width: w, height: h } );
		this.r_window_frame.attr( { width: w, height: h } );
		this.r_window_body.attr( { width: w - 10, height: h - 20 } );
		this.r_window_add_button.attr( { cx: x + s.width - 22, cy: y + 8 } )
		this.r_window_remove_button.attr( { cx: x + s.width - 10, cy: y + 8 } )
	},
	//}}}
	setPosition: function( x, y ) {//{{{
		this.r_window.attr( { x: x, y: y } );
		this.r_window_frame.attr( { x: x + 4, y: y + 4 } );
		this.r_window_body.attr( { x: x + 5, y: y + 15 } );
		this.r_window_header.attr( { x: x + 35, y: y + 8 } );
	},
	//}}}
	getConnect: function() {
		return this.r_window
	},
	addWindow: function() {
		var tp = this.canvas.getToolsProvider();
		var w = tp.installWindow();
		tp.getLine( this.canvas ).connectTo( this, w );
	},
	serialize: function() {//{{{
		var r = Seiho.mm.element.Window.superclass.serialize.apply( this, arguments )
		Ext.apply( r, { 
			title: this.title,
			x: this.x,
			y: this.y
		});
		return r
	}
});
//}}}
Seiho.mm.element.Line   = Ext.extend( Seiho.mm.element.BaseElement, {//{{{
	// first point
	x1     : 10,
	y1     : 10,
	// second point
	x2     : 100,
	y2     : 100,
	// radius 1
	z1     : 20,
	z2     : 20,
	// radius 2
	z3     : 110,
	z4     : 110,
	install: function() {//{{{
		this.initLine( this.x1, this.y1, this.z1, this.z2, this.z3, this.z4, this.x2, this.y2 );
		Seiho.mm.element.Line.superclass.install.apply( this, arguments );
		// ..
		return this
	},
	//}}}
	connectTo: function( f, t ) {//{{{
		var r  = this.canvas.raphael;
		var rr = r.connection( f.getConnect(), t.getConnect(), "#99bbe8", "#99bbe8|2" ) 
		// register connection
		var fac = f.connections || new Ext.util.MixedCollection();
		fac.add( t );
		f.connections = fac;
		// ..
		var el = Ext.get( rr.bg.node );

		var contextMenu = function( e ) {
			Seiho.Logger.log( e.getXY() );
		}
		var update = function( w, x, y) {
			r.connection( rr );
		}
		var destroy = function() {
			rr.line.remove();
			rr.bg.remove();
			// unregister connections
			f.connections.remove( t );
		}
		// ..
		el.on( 'contextmenu', contextMenu )		
		// ..
		f.on( 'move', update )    ;t.on( 'move', update );
		f.on( 'drag', update )    ;t.on( 'drag', update );
		f.on( 'resize', update )  ;t.on( 'resize', update );
		f.on( 'remove', destroy ) ;t.on( 'remove', destroy );
		// ..
	},

	initLine : function(x, y, ax, ay, bx, by, zx, zy) {
		var r = this.canvas.raphael;
		var path = [["M", x, y], ["C", ax, ay, bx, by, zx, zy]],
		path2 = [["M", x, y], ["L", ax, ay], ["M", bx, by], ["L", zx, zy]],
		curve = r.path(path).attr({stroke: Raphael.getColor(), "stroke-width": 2}),
		controls = r.set(
			r.path(path2).attr({stroke: "#999", "stroke-opacity": .3}),
			r.circle(x, y, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6}),
			r.circle(ax, ay, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6}),
			r.circle(bx, by, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6}),
			r.circle(zx, zy, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6})
		);
		controls[1].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[0][1] = X;
			path[0][2] = Y;
			path2[0][1] = X;
			path2[0][2] = Y;
			controls[2].update(x, y);
		};
		controls[2].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[1][1] = X;
			path[1][2] = Y;
			path2[1][1] = X;
			path2[1][2] = Y;
			curve.attr({path: path});
			controls[0].attr({path: path2});
		};
		controls[3].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[1][3] = X;
			path[1][4] = Y;
			path2[2][1] = X;
			path2[2][2] = Y;
			curve.attr({path: path});
			controls[0].attr({path: path2});
		};
		controls[4].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[1][5] = X;
			path[1][6] = Y;
			path2[3][1] = X;
			path2[3][2] = Y;
			controls[3].update(x, y);
		};
		controls.mousedown(function (e) {
		//                      drag = this;
		//                        E.x = e.clientX;
		//                    E.y = e.clientY;
		});
	}
	//}}} 
})
//}}}












/*
Seiho.mm.element.Line   = Ext.extend( Seiho.mm.element.BaseElement, {//{{{
	// first point
	x1     : 10,
	y1     : 10,
	// second point
	x2     : 100,
	y2     : 100,
	// radius 1
	z1     : 20,
	z2     : 20,
	// radius 2
	z3     : 110,
	z4     : 110,
	install: function() {//{{{
		this.initLine( this.x1, this.y1, this.z1, this.z2, this.z3, this.z4, this.x2, this.y2 );
		Seiho.mm.element.Line.superclass.install.apply( this, arguments );
		// ..
		return this
	},
	//}}}
	connectTo: function( f, t ) {//{{{
		var r  = this.canvas.raphael;
		var rr = r.connection( f.raphael_rect, t.raphael_rect, "#99bbe8", "#99bbe8|2" ) 
		// register connection
		var fac = f.connections || new Ext.util.MixedCollection();
		fac.add( t );
		f.connections = fac;
		// ..
		var el = Ext.get( rr.bg.node );

		var contextMenu = function( e ) {
			Seiho.Logger.log( e.getXY() );
		}
		var update = function( w, x, y) {
			r.connection( rr );
		}
		var destroy = function() {
			rr.line.remove();
			rr.bg.remove();
			// unregister connections
			f.connections.remove( t );
		}
		// ..
		el.on( 'contextmenu', contextMenu )		
		// ..
		f.on( 'move', update )    ;t.on( 'move', update );
		f.on( 'drag', update )    ;t.on( 'drag', update );
		f.on( 'resize', update )  ;t.on( 'resize', update );
		f.on( 'destroy', destroy );t.on( 'destroy', destroy );
		// ..
	},

	initLine : function(x, y, ax, ay, bx, by, zx, zy) {
		var r = this.canvas.raphael;
		var path = [["M", x, y], ["C", ax, ay, bx, by, zx, zy]],
		path2 = [["M", x, y], ["L", ax, ay], ["M", bx, by], ["L", zx, zy]],
		curve = r.path(path).attr({stroke: Raphael.getColor(), "stroke-width": 2}),
		controls = r.set(
			r.path(path2).attr({stroke: "#999", "stroke-opacity": .3}),
			r.circle(x, y, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6}),
			r.circle(ax, ay, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6}),
			r.circle(bx, by, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6}),
			r.circle(zx, zy, 3).attr({fill: "#999", "stroke-opacity": 0, "stroke-width": 6})
		);
		controls[1].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[0][1] = X;
			path[0][2] = Y;
			path2[0][1] = X;
			path2[0][2] = Y;
			controls[2].update(x, y);
		};
		controls[2].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[1][1] = X;
			path[1][2] = Y;
			path2[1][1] = X;
			path2[1][2] = Y;
			curve.attr({path: path});
			controls[0].attr({path: path2});
		};
		controls[3].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[1][3] = X;
			path[1][4] = Y;
			path2[2][1] = X;
			path2[2][2] = Y;
			curve.attr({path: path});
			controls[0].attr({path: path2});
		};
		controls[4].update = function (x, y) {
			var X = this.attr("cx") + x,
				Y = this.attr("cy") + y;
			this.attr({cx: X, cy: Y});
			path[1][5] = X;
			path[1][6] = Y;
			path2[3][1] = X;
			path2[3][2] = Y;
			controls[3].update(x, y);
		};
		controls.mousedown(function (e) {
		//                      drag = this;
		//                        E.x = e.clientX;
		//                    E.y = e.clientY;
		});
	}
	//}}} 
})
//}}}
Seiho.mm.element.Window = Ext.extend( Ext.Window, {//{{{
	width        : 200,
	height       : 100,
	x            : 100,
	y            : 100,
	iconCls      : 'icon-page_white',
	title        : 'Bez tytułu',
	// FIXME CHANGE TO MULTI EXTENDS
	constructor: function( canvas, config ){//{{{
		this.canvas   = canvas;
		this.renderTo = this.canvas.body;
		Ext.apply( this, config || {} );
		// ..
		Seiho.mm.element.Window.superclass.constructor.call( this )
	},
	//}}}
	serialize: function() {//{{{
		return {
			title: this.title						
		};
	},
	//}}}
	// .....
	initComponent: function() {//{{{

		this.addEvents( 'drag' );

		Ext.apply( this, {
			autoShow: true,
			tools: [
				{
					id     : 'plus',
					qtip   : 'Dodaj następny element',
					handler: this.addWindow,
					scope  : this
				}
			]
		});
		Seiho.mm.element.Window.superclass.initComponent.apply( this, arguments );

		this.on( 'resize', this._onResize, this );
		this.on( 'move'  , this._onMove  , this );
		this.on( 'drag'  , this._onDrag  , this );
	},
	//}}}
	afterRender   : function() {//{{{
		Seiho.mm.element.Window.superclass.afterRender.call( this );
		// create svg rect
		var w = this.getWidth(), h = this.getHeight(), x = this.x, y = this.y;
		var c = Raphael.getColor();
		this.raphael_rect = this.canvas.raphael.rect( x, y, w, h, 5 ).attr({ stroke: '#99bbe8', fill: '#99bbe8', "fill-opacity": .9 });
		// ..
		this.header.on( 'dblclick', this.startTitleEdit, this );
	},
	//}}}
	install: function() {//{{{
		this.show();
		this.canvas.registerElement( this );
		this.fireEvent( 'add', this, this.canvas );		
		// ..
		return this
	},
	//}}}
	uninstall: function() {//{{{
		this.canvas.unregisterElement( this );
		this.fireEvent( 'remove', this, this.canvas );
		// ..
		this.close();
	},
	//}}}
	startTitleEdit: function() {//{{{
		// TODO canvas.getEditor() ?
		//EDITOR.startEdit( this, this.getPanelHeader(), null, this.getWidth() - 70 );
	},
	//}}}
	addWindow: function() {
		var tp = this.canvas.getToolsProvider();
		var w = tp.installWindow();
		tp.getLine( this.canvas ).connectTo( this, w );
	},
	// private
	initDraggable : function(){//{{{
		// FUUUUUUUUUUUU!
		var that = this
		this.dd = new Seiho.mm.element.Window.DD( this, {
			onDrag : function( e ) {
				this.alignElWithMouse(this.proxy, e.getPageX(), e.getPageY());
				that._onElDrag( e )
			}
		});
	},
	//}}}
	// private
	_onElDrag: function( e ) {//{{{
		var x = this.activeGhost.getLeft( true ), y = this.activeGhost.getTop( true );
		this.fireEvent( 'drag', this, x, y );
	},
	//}}}

	// private
	getPanelHeader: function() {//{{{
		if( this.header && this.headerAsText ) {
			return this.header.child( "span" )
		}
		return null;
	},
	//}}}
	_onMove: function( el, x, y ) {//{{{
		if( this.raphael_rect )
		this.raphael_rect.attr( { x: x, y: y } );
	},
	//}}}
	_onDrag: function( el, x, y ) {//{{{
		this._onMove( el, x, y );
	},
	//}}}
	_onResize: function( el, w, h ) {//{{{
		if( this.raphael_rect )
			this.raphael_rect.attr( { width: w, height: h } );
	}
	//}}}
});
//}}}

// private - custom Window DD implementation
Seiho.mm.element.Window.DD = function( win, config ){//{{{
	this.win = win;
	Ext.apply( this, config );
	Seiho.mm.element.Window.DD.superclass.constructor.call( this, win.el.id, 'WindowDD-'+win.id );
	this.setHandleElId( win.header.id );
	this.scroll = false;
};

Ext.extend( Seiho.mm.element.Window.DD, Ext.dd.DD, {
	moveOnly:true,
	headerOffsets:[100, 25],
	startDrag : function(){
		var w = this.win;
		this.proxy = w.ghost();
		if(w.constrain !== false){
			var so = w.el.shadowOffset;
			this.constrainTo(w.container, {right: so, left: so, bottom: so});
		}else if(w.constrainHeader !== false){
			var s = this.proxy.getSize();
			this.constrainTo(w.container, {right: -(s.width-this.headerOffsets[0]), bottom: -(s.height-this.headerOffsets[1])});
		}
	},
	b4Drag : Ext.emptyFn,
	endDrag : function(e){
		this.win.unghost();
		this.win.saveState();
	}
});
//}}}
*/

Seiho.mm.tools.Registry.register( Seiho.mm.element.Image )
Seiho.mm.tools.Registry.register( Seiho.mm.element.Window )

// vim: fdm=marker ts=4 st=4 sts=4
