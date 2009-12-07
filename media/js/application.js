Ext.namespace( 
	'Seiho.mm',
		config = config || {};
	'Seiho.mm.element'
);
// FIXME change
var CANVAS = null;
var COUNTER = 0;
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
Seiho.mm.WindowGroup = function(){//{{{
    var list = {};
    var accessList = [];
    var front = null;

    // private
    var sortWindows = function(d1, d2){
        return (!d1._lastAccess || d1._lastAccess < d2._lastAccess) ? -1 : 1;
    };

    // private
    var orderWindows = function(){
        var a = accessList, len = a.length;
        if(len > 0){
            a.sort(sortWindows);
            var seed = a[0].manager.zseed;
            for(var i = 0; i < len; i++){
                var win = a[i];
                if(win && !win.hidden){
                    win.setZIndex(seed + (i*10));
                }
            }
        }
        activateLast();
    };

    // private
    var setActiveWin = function(win){
        if(win != front){
            if(front){
                front.setActive(false);
            }
            front = win;
            if(win){
                win.setActive(true);
            }
        }
    };

    // private
    var activateLast = function(){
        for(var i = accessList.length-1; i >=0; --i) {
            if(!accessList[i].hidden){
                setActiveWin(accessList[i]);
                return;
            }
        }
        // none to activate
        setActiveWin(null);
    };

    return {
        zseed : 1,

        // private
        register : function(win){
            list[win.id] = win;
            accessList.push(win);
            win.on('hide', activateLast);
        },

        // private
        unregister : function(win){
            delete list[win.id];
            win.un('hide', activateLast);
            accessList.remove(win);
        },
        get : function(id){
            return typeof id == "object" ? id : list[id];
        },
        bringToFront : function(win){
            win = this.get(win);
            if(win != front){
                win._lastAccess = new Date().getTime();
                orderWindows();
                return true;
            }
            return false;
        },
        sendToBack : function(win){
            win = this.get(win);
            win._lastAccess = -(new Date().getTime());
            orderWindows();
            return win;
        },
        hideAll : function(){
            for(var id in list){
                if(list[id] && typeof list[id] != "function" && list[id].isVisible()){
                    list[id].hide();
                }
            }
        },
        getActive : function(){
            return front;
        },
        getBy : function(fn, scope){
            var r = [];
            for(var i = accessList.length-1; i >=0; --i) {
                var win = accessList[i];
                if(fn.call(scope||win, win) !== false){
                    r.push(win);
                }
            }
            return r;
        },
        each : function(fn, scope){
            for(var id in list){
                if(list[id] && typeof list[id] != "function"){
                    if(fn.call(scope || list[id], list[id]) === false){
                        return;
                    }
                }
            }
	},
	getNextWindow: function( c ) {
		if( !c ) return null;
		// ..
		var w = null, r;
		this.each( function( i ) {
			if( !w ) w = i; // set first
			// ..
			if( r ) {
				w = i;
				return false;
			}
			if( i.id == c.id ) {
				r = true;	
			} 
		});
		return ( w && w.id != c.id ) ? w : null;
	},
	getPrevWindow: function( c ) {
		if( !c ) return null;
		// ..
		var w = null;
		this.each( function( i ) {			
			if( i.id == c.id && w ) {
				return false;
			}
			w = i;	
		});
		return ( w && w.id != c.id ) ? w : null;
	},
	activateNext: function( ) {
		if( ( w = this.getNextWindow( this.getActive() ) ) != null ) {
			this.bringToFront( w );
		}
	},
	activatePrev: function() {
		if( ( w = this.getPrevWindow( this.getActive() ) ) != null ) {
			this.bringToFront( w );
		}	
	}
    };
};
//}}}
var EDITOR = new Seiho.mm.Editor();
var WINDOW_GROUP = new Seiho.mm.WindowGroup();
Seiho.mm.application = function() {//{{{
	return {
		init: function() {
			Ext.QuickTips.init();
			// ..
			new Ext.Viewport({
				layout    : 'border',
				items     : [
					/*new Seiho.mm.Tools({
						region : 'west',
						width  : 250,
						margins: '2 2 2 2'
					}),*/
					CANVAS = new Seiho.mm.Canvas({
						margins: '2 2 2 2',
						region: 'center',
						width : 5000,
						height: 5000
					})
				]
			})
		},
		installElement: function( el, conn ) {
			return el.renderToCanvas( CANVAS, conn );
		} 
	}
}();
//}}}
Seiho.mm.Tools = Ext.extend( Ext.Panel, {//{{{
	title        : 'Elementy',
	iconCls      : 'icon-page_white',
	collapsible  : true,
	collapsed    : true,
	initComponent: function() {
		Ext.apply( this, {
			tbar: [
				{
					iconCls: 'icon-page',
					text   : 'Nowy',
					handler: this.installElement,
					scope  : this
				}
			]
		});
		Seiho.mm.Tools.superclass.initComponent.apply( this, arguments );
	}
});
//}}}
Seiho.mm.Canvas = Ext.extend( Ext.Panel, {//{{{
	maxWidth    : 5000,
	maxHeight   : 5000,
	gridSize    : 10,
	bodyCssClass: 'mm_canvas',
	autoScroll  : true,
	initComponent: function() {
		Ext.apply( this, {
			tbar: [
				{
					xtype: 'buttongroup',
					items: 
						[
							{
								text     : 'Plik',
								iconCls  : 'icon-page',
								menu     : [
									{ 
										text: 'Nowy ...',
										iconCls: 'icon-page_white',
										handler: function() {
											WINDOW_GROUP.each( function( w ) { w.close() });
										},
										scope  : this
									},
									'-',
									{ text: 'Zapisz' },
									{ text: 'Zapisz jako ...' },
									'-',
									{ text: 'Zamknij', iconCls: 'icon-cross' }
								]
							},{
								text     : 'Edycja',
								iconCls  : 'icon-page_edit',
								menu     : [
									{ text: 'Cofnij', iconCls: 'icon-arrow_undo' },
									{ text: 'Ponów', iconCls: 'icon-arrow_redo' },
									'-',
									{ text: 'Wytnij'},
									{ text: 'Kopiuj'},
									{ text: 'Wklej'},
									'-',
									{ text: 'Ustawienia', iconCls: 'icon-page_white_gear' }
								]
							},{
								text     : 'Widok',
								iconCls  : 'icon-page_white',
								menu     : [
									{ text: 'Nowy ...'}
								]
							},{
								text     : 'Pomoc',
								iconCls  : 'icon-help',
								menu     : [
									{  text: 'O nas ...', handler: this.aboutUs, scope: this }
								]
							}
						]
				},
				'->',
				/*{
					xtype   : 'buttongroup',
					defaults: {
						iconAlign: 'top'
					},
					items   : [
						{
							iconCls: 'icon-page',
							handler: function() {
								Seiho.mm.application.installElement( new Seiho.mm.element.Prototype({ title: 'Test', renderTo: CANVAS.body, x: 300, y: 150 }) );
							},
							scope  : this
						},{
							iconCls: 'icon-page_delete'
						},{
							iconCls: 'icon-arrow_refresh_small'
						}
					]
				},{
					xtype   : 'buttongroup',
					defaults: {
						iconAlign: 'top'
					},
					items   : [
						{
							iconCls: 'icon-page_add',
						},{
							iconCls: 'icon-page_save',
						}
					]
				},*/
				' ',
				'<div id="seiho-text"><span class="highlight">seiho</span>MindMapper <span class="beta">DEVELOPMENT PREVIEW</span></div>'
			],
			keys_: 
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
		// TODO check
		map = new Ext.KeyMap( document, this.keys_ );
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
		this.raphael = Raphael( this.body.id, this.maxWidh, this.maxHeight);
	},
	addElement: function( element, connection ) {
		
		if( !element.rendered || !element.isVisible() ) {
			element.show();
		}
		var /*xy = FAIL at start -> element.getPosition(),*/ w = element.getWidth(), h = element.getHeight(), x = element.x, y = element.y;
		element.raphael_rect = this.raphael.rect( x, y, w, h ).attr({ stroke: "" });
		element.canvas = this;

		if( connection != null ) {
			var r = this.raphael.connection( connection.raphael_rect, element.raphael_rect, "#99bbe8", "#99bbe8|2" ) 
			//this.connections.push( r );
			element.registerConnection( r )
			connection.registerConnection( r )
		}
		return element;
	},
	
	installNewElement: function() {
		var a = WINDOW_GROUP.getActive();
		if( a ) {
			a.installElement();
		} else {
			Seiho.mm.application.installElement( new Seiho.mm.element.Prototype({ renderTo: CANVAS.body }) );
		}
	},

	startElementTitleEdit: function() {
		var a = WINDOW_GROUP.getActive();
		if( a ) {
			a.startTitleEdit();
		}		
	},

	moveElementTo: function( l, r, t, b ) {
		var a = WINDOW_GROUP.getActive();
		if( a ) {
			a.moveTo( l, r, t, b );
		}		
	},
	aboutUs: function() {
		var r = this.raphael, dashed = { "stroke-width": 2, fill: "none", stroke: "orange", "stroke-dasharray": "- "};
		r.path( "M100 200C 100, 100 400, 100 400, 200").attr( dashed );
		function curve(x, y, ax, ay, bx, by, zx, zy) {
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
                curve(100, 100, 140, 100, 160, 200, 200, 200);
                //curve(200, 100, 240, 100, 260, 200, 300, 200);
                //curve(300, 100, 340, 100, 360, 200, 400, 200);
                //curve(400, 100, 440, 100, 460, 200, 500, 200);
                //curve(500, 100, 540, 100, 560, 200, 600, 200);
	}
});
//}}}
/**
 * Prototype of Canvas Element
 */
Seiho.mm.element.Prototype = Ext.extend( Ext.Window, {//{{{
	width        : 200,
	height       : 100,
	iconCls      : 'icon-page_white',
	manager      : WINDOW_GROUP,
	initComponent: function() {
		this.connections = [];		
		
		this.title = this.title || 'Bez tytułu ' + ( ++COUNTER ); 		
		if( !this.x ) {
			var a = this.manager.getActive();
			if( a ) {
				var xy = a.getPosition( true );
				this.x = xy[0] + a.width + a.width/2;
				this.y = xy[1] + a.height;
			} else {
				this.x     = this.x || 150;  
				this.y     = this.y || 150;
			}
		}  
		
		Ext.apply( this, {
			tools: [
				{
					id     : 'plus',
					qtip   : 'Dodaj następny element',
					handler: this.installElement,
					scope  : this
				}
			]
			/*
			,
			keys  : 
			[
				// intall element on CTRL+ENTER
				{
					key      : Ext.EventObject.ENTER,
					ctrl     : true,
					stopEvent: true,
					fn       : this.installElement,
					scope    : this
				},
				// Edit title on ALT+ENTER
				{
					key      : Ext.EventObject.ENTER,
					alt      : true,
					stopEvent: true,
					fn       : this.startTitleEdit,
					scope    : this
				},
				{
					key      : Ext.EventObject.SPACE,
					ctrl     : true,
					stopEvent: true,
					fn       : function() {
						WINDOW_GROUP.activateNext()
					},
					scope    : this
				},
				// move element with alt + LEFT, RIGHT, TOP, BOTTOM
				{
					key      : Ext.EventObject.LEFT,
					alt      : true,
					stopEvent: true,
					fn       : this.moveTo.createDelegate( this, [ 10, 0, 0, 0 ] )
				},{
					key      : Ext.EventObject.RIGHT,
					alt      : true,
					stopEvent: true,
					fn       : this.moveTo.createDelegate( this, [ 0, 10, 0, 0 ] )
				},{
					key      : Ext.EventObject.UP,
					alt      : true,
					stopEvent: true,
					fn       : this.moveTo.createDelegate( this, [ 0, 0, 10, 0 ] )
				},{
					key      : Ext.EventObject.DOWN,
					alt      : true,
					stopEvent: true,
					fn       : this.moveTo.createDelegate( this, [ 0, 0, 0, 10 ] )
				}
			]*/	 
		});
		Seiho.mm.element.Prototype.superclass.initComponent.apply( this, arguments );
		
		this.on( 'resize' , this.updateRect, this )
		this.on( 'move'   , this.updatePos , this )
		this.on( 'destroy', this._onDestroy, this )
		//..
		this.on( 'render' , this.startTitleEdit, this, { delay:  500 } )
	},
	afterRender   : function() {
		Seiho.mm.element.Prototype.superclass.afterRender.call( this );
		// ..
		this.header.on( 'dblclick', this.startTitleEdit, this );
	},
	renderToCanvas: function( canvas, connection ) {
		return canvas.addElement( this, connection );
	},
	updateRect: function( el, w, h ) {
		if( this.raphael_rect ) {
			this.raphael_rect.attr({ width: w, height: h });
			this.updateConnections()
		}
	},
	updatePos: function( el, x, y ) {
		if( this.raphael_rect ) {
			this.raphael_rect.attr({ x: x, y: y });
			this.updateConnections()
		}
	},
	registerConnection: function( c ) {
		this.connections.push( c );
	},
	updateConnections: function() {
            for( var i = this.connections.length; i--; ) {
                this.canvas.raphael.connection( this.connections[i] );
            }
	},
	// private
	initDraggable : function(){
		// FUUUUUUUUUUUU!
		var that = this
		this.dd = new Seiho.mm.element.Prototype.DD( this, {
 			onDrag : function( e ) {
        			this.alignElWithMouse(this.proxy, e.getPageX(), e.getPageY());
				that._onDrag( e )
    			}
		});
    	},
	installElement: function() {
		Seiho.mm.application.installElement( new Seiho.mm.element.Prototype({ renderTo: this.canvas.body }), this );
	},
	_onDrag: function( e ) {
		var x = this.activeGhost.getLeft( true ), y = this.activeGhost.getTop( true );
	 	this.updatePos( this, x, y );
	},
	_onDestroy: function() {
		for( var i = this.connections.length; i--; ) {
			this.connections[i].line.remove();
			this.connections[i].bg.remove();
            	}
		this.raphael_rect.remove();
		this.canvas.raphael.safari();
	},
	startTitleEdit: function() {
		EDITOR.startEdit( this, this.getPanelHeader(), null, this.getWidth() - 70 );
	},
	moveTo: function( l, r, t, b ) {
		var xy = this.getPosition( true ), x = xy[0], y = xy[1];
		// ..
		x -= l;
		x += r;
		y -= t;
		y += b;
		this.setPosition( x, y );
	},
	// private
	getPanelHeader: function() {
		if( this.header && this.headerAsText ) {
			return this.header.child( "span" )
		}
		return null;
	}
});
//}}}
// private - custom Window DD implementation
Seiho.mm.element.Prototype.DD = function( win, config ){//{{{
	this.win = win;
	Ext.apply( this, config );
	Seiho.mm.element.Prototype.DD.superclass.constructor.call( this, win.el.id, 'WindowDD-'+win.id );
	this.setHandleElId( win.header.id );
	this.scroll = false;
};

Ext.extend( Seiho.mm.element.Prototype.DD, Ext.dd.DD, {
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
/*
Seiho.mm.element.Line = {
	Pen:1,
	HoverPen:5,
	RELATION_SPACING:15,
	
	destroy:function(){
		Ext.get(this.path).remove();
	},

	DrawArcLeft:function(p1,p2){
		var mid = Math.min(p1.x,p2.x) - this.RELATION_SPACING; // this is what makes arc left/right
		this.DrawArc(p1,p2,mid)
	},
	DrawArcRight:function(p1,p2){
		var mid = Math.max(p1.x,p2.x) + this.RELATION_SPACING; // this is what makes arc left/right
		this.DrawArc(p1,p2,mid)
	}
};

Seiho.mm.element.BaseLine = function(cfg){
	this.Init=function(cfg){
		Ext.apply(this,cfg)
		Ext.apply(this,Seiho.mm.element.Line)
		var p = document.createElementNS('http://www.w3.org/2000/svg', "path");
		p.setAttribute("stroke","black");
		p.setAttribute("stroke-width", 2);
		p.setAttribute("fill","none");
		//p.setAttribute("onmouseover","this.setAttribute('stroke-width'," + this.HoverPen + ")");
		//p.setAttribute("onmouseout","this.setAttribute('stroke-width'," + this.Pen + ")");
		this.Canvas.SVG.appendChild(p); // svg specific
		this.path=p	
	}
	this.Show=function(){this.path.setAttribute('visibility','');}
	this.Hide=function(){this.path.setAttribute("visibility","hidden")}
	this.DrawS=function(p1,p2){
		var mid = Math.floor(Math.abs((p1.x - p2.x)/2));
		var str = "M " + p1.x + " " + p1.y 
		str += " C " + (p1.x + mid) + " " + p1.y + " " + (p2.x - mid)+" "+p2.y+" "
		str += p2.x+" "+p2.y;
		this.path.setAttribute("d",str);	
	}
	this.DrawArc=function(p1,p2,mid){
		var str = "M "+p1.x+" "+p1.y+" C " + mid + " "+p1.y+" ";
		str += mid + " " + p2.y + " " + p2.x + " " + p2.y;
		this.path.setAttribute("d",str);	
	}

	this.Init(cfg)
};
*/



// PROTOTYPES
Seiho.mm.Element = Ext.extend( Ext.util.Observable, {//{{{
    constructor: function( canvas, config ){//{{{
        this.canvas = canvas;
        this.addEvents(
            'add',
            'remove'
        );

		Ext.apply( this, config || {} );
        Seiho.mm.Element.superclass.constructor.call( config )
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
Seiho.mm.Registry = Ext.extend( Ext.util.MixedCollection, {//{{{
	register  : function( e ) {
		return this.add( e );
	},
	unregister: function() {
		return this.remove( e );
	}
});
//}}}

Ext.onReady( Seiho.mm.application.init, Seiho.mm.application )
// vim: fdm=marker ts=4 sw=4 sts=4
