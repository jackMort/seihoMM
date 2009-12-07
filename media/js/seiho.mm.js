Ext.namespace( 
	'Seiho.mm',
	'Seiho.mm.element' 
);
// ...................
Seiho.mm.Canvas = Ext.extend( Ext.Panel, {//{{{
	maxWidth      : 5000,
	maxHeight     : 5000,
	gridSize      : 10,
	bodyCssClass  : 'mm_canvas',
	autoScroll    : true,
	// mart that is canvas
	yeahItIsCanvas: Ext.emptyFn,
	initComponent : function() {
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

		// TODO check
		//map = new Ext.KeyMap( document, this.keys_ );
		Seiho.mm.Canvas.superclass.initComponent.apply( this, arguments );
	},
	afterRender  : function() {
		Seiho.mm.Canvas.superclass.afterRender.call( this );
		//..
		this.DropTarget = new Ext.dd.DropTarget( this.body, {
			ddGroup   : 'canvas',
			scope     : this,
			cb        : this.notifyDrop,
			notifyDrop: function( src, e, data ) {
				return this.cb.call( this.scope, src, e, data );
			}
		});
		
		// create Raphael svg object
		this.raphael = Raphael( this.body.id, this.maxWidth, this.maxHeight);
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
	}
});
//}}}
Seiho.mm.Registry = Ext.extend( Ext.util.MixedCollection, {//{{{
	register  : function( e ) {
		return this.add( e );
	},
	unregister: function() {
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
	constructor: function( canvas, config ){//{{{
        	this.canvas = canvas;
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
	install: function() {//{{{
		this.canvas.registerElement( this );
		// ..
		this.fireEvent( 'add', this, this.canvas );		
	},
	//}}}
	uninstall: function() {//{{{
		this.canvas.unregisterElement( this );
		// ..
		this.fireEvent( 'remove', this, this.canvas );
	},
	//}}}
	serialize: function() {//{{{
		return {
			title: this.title						
		};
	}
	//}}}
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
	/**
	 * Make connection from window1 to window2
	 */
	connectTo: function( f, t ) {//{{{
		var r  = this.canvas.raphael;
		var rr = r.connection( f.raphael_rect, t.raphael_rect, "#99bbe8", "#99bbe8|2" ) 
		var el = Ext.get( rr.bg.node );

		var contextMenu = function( e ) {
			console.log( e.getXY() );
		}
		var update = function( w, x, y) {
			r.connection( rr );
		}
		var destroy = function() {
			rr.line.remove();
			rr.bg.remove();
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
		var /*xy = FAIL at start -> element.getPosition(),*/ w = this.getWidth(), h = this.getHeight(), x = this.x, y = this.y;
		this.raphael_rect = this.canvas.raphael.rect( x, y, w, h ).attr({ stroke: "" });
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
		this.close();
		// ..
		this.canvas.unregisterElement( this );
		this.fireEvent( 'remove', this, this.canvas );
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
// vim: fdm=marker ts=4 st=4 sts=4
