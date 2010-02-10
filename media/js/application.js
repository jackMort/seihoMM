/**
 * application.js
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
	'Seiho.mm.application.App'
);

// global editor
Seiho.mm.application.Editor = new Seiho.mm.Editor();
// ........

Seiho.mm.application.ToolsProvider = Ext.extend( Ext.Toolbar, {//{{{
	initComponent: function() {
		Ext.apply( this, {
			items: [
				' ',
				{
					xtype    : 'textfield',
					width    : 250,
					emptyText: 'Wyszukaj element ...'
				},
				'->',{
					iconCls: 'icon-application_get',
					handler: this.installWindow,
					scope  : this
				}, ' ', {
					iconCls: 'icon-application_lightning',
					handler: this.installLine,
					scope  : this
				},'-', {
					iconCls    : 'icon-tag_green',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_blue',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_purple',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_orange',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_pink',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_red',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_yellow',
					toggleGroup: 'colors'
				},
				' '
			]
		});
		Seiho.mm.application.ToolsProvider.superclass.initComponent.apply( this, arguments );
	},
	
	getCanvas: function() {
		var t = Seiho.mm.application.App.tabPanel.getActiveTab();
		if( t.yeahItIsCanvas ) {
			return t
		}
		return null;
	},	
	installWindow: function() {
		var c = this.getCanvas();
		if( c != null ) {
			return this.getWindow( c ).install();
		}
	},
	installLine: function() {
		var c = this.getCanvas();
		if( c != null ) {
			return this.getLine( c ).install();
		}
	},
	getWindow: function( c ) {
		// TODO return Last active window component
		return new Seiho.mm.element.Window( c );
	},
	getLine : function( c ) {//{{{
		// TODO return last active line component
		return new Seiho.mm.element.Image( c );
	}
	//}}}
});
//}}}
Seiho.mm.application.TabPanel = Ext.extend( Ext.TabPanel, {//{{{
	border       : false,
	initComponent: function() {
		Ext.apply( this, {
			activeTab: 0,
			items    : [ new Seiho.mm.application.HomePanel() ]
		});
		Seiho.mm.application.TabPanel.superclass.initComponent.apply( this, arguments );
	},
    getTabTarget: function (d) {
        if (d.getTarget("b", 1)) {
            return false
        }
        var g = this;
        if (g) {
            var k = d.getPoint();
            var f = g.stripWrap.getRegion();
            if (!f.contains(k)) {
                return
            }
            var j = g.stripWrap.dom.getElementsByTagName("li"),
            b = false;
            for (var a = 0, c = j.length - 1; a < c; a++) {
                var h = j[a];
                if (Ext.fly(h).getRegion().contains(k)) {
                    b = a;
                    break
                }
            }
            return b
        }
        return false
	},
	editTitle: function( t ) {
		var el = this.getTabEl( t );
		el = el.getElementsByTagName( 'span' );
		el = el[1]
		Seiho.mm.application.Editor.startEdit( this, el, null );
	}
});
//}}}
Seiho.mm.application.HomePanel = Ext.extend( Ext.Panel, {//{{{
	id           : 'mm_home_tab',
	autoScroll   : true,
	initComponent: function() {
		Ext.apply( this, {
			title    : 'Dashboard',
			iconCls  : 'icon-house',
			autoLoad : '/welcome.html'
		});
		Seiho.mm.application.HomePanel.superclass.initComponent.apply( this, arguments );
	}
});
//}}}
Seiho.mm.application.App = function() {//{{{
	var toolsProvider = new Seiho.mm.application.ToolsProvider(); 	
	var tabPanel      = new Seiho.mm.application.TabPanel({
		//tbar: toolsProvider
	});
	var keyMap        = new Ext.KeyMap( document, [
		// intall element on CTRL+ENTER
		{
			key      : Ext.EventObject.N,
			ctrl     : true,
			shift    : true,
			stopEvent: true,
			fn       : function() {
				Seiho.mm.application.App.newCanvas()
			}
		}
	]);

	return {
		tabPanel: null,
		init    : function() {
			Ext.QuickTips.init();
			// ..
			new Ext.Viewport({
				layout    : 'border',
				items     : [
					{ 
						layout : 'fit',
						region : 'center',
						margins: '2 2 2 2',
						items  : tabPanel,
						tbar   : [
							{
								xtype: 'buttongroup',
								items: 
									[
										{
											text     : 'Plik',
											iconCls  : 'icon-page',
											menu     : 
												[
													{ 
														text   : 'Now Mapa ...',
														iconCls: 'icon-page_white',
														handler: Seiho.mm.application.App.newCanvas
													},{ 
														text   : 'Importuj ...',
														iconCls: 'icon-page_white_get',
														handler: Seiho.mm.application.App.newCanvas
													},
													{ 
														text   : 'Zapisz', 
														iconCls: 'icon-page_save', 
														handler: Seiho.mm.application.App.save 
													},
													'-',
													{ 
														text   : 'Zamknij',
														iconCls: 'icon-cross',  
														handler: Seiho.mm.application.App.close
													}
												]
										},{
											text     : 'Edycja',
											iconCls  : 'icon-page_edit',
											menu     : 
												[
													{ text: 'Cofnij', iconCls: 'icon-arrow_undo' },
													{ text: 'Ponów', iconCls: 'icon-arrow_redo' },
													'-',
													{ text: 'Wytnij', iconCls: 'icon-cut' },
													{ text: 'Kopiuj', iconCls: 'icon-page_white_copy' },
													{ text: 'Wklej' , iconCls: 'icon-page_white_paste' },
													'-',
                                                    { 
                                                        text: 'Pluginy',
                                                        // TODO: add register plugin
                                                        menu: 
                                                            [
                                                                { 
                                                                    text: 'Director',
                                                                    handler: function() {
                                                                        var t = tabPanel.getActiveTab();
                                                                        // TODO create isCanvas
                                                                        if( t.yeahItIsCanvas ) {
                                                                            t.installPlugin( new Seiho.mm.plugins.Director() )
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                    },
													{ text: 'Ustawienia', iconCls: 'icon-page_white_gear' }
												]
										},{
											text     : 'Widok',
											iconCls  : 'icon-page_white',
											menu     : 
												[
													{ text: 'Nowy ...' }
												]
										},{
											text     : 'Pomoc',
											iconCls  : 'icon-help',
											menu     : 
												[
													{  text: 'O nas ...', handler: Seiho.mm.application.App.aboutUs, scope: this }
												]
										}
								]
							},
							'->',
							' ',
							'<div id="seiho-text"><img src="/media/images/logo.png"/></div>'
						]
					}  
				]
			});

			Seiho.mm.application.App.tabPanel = tabPanel;

			// edit title ...
			tabPanel.header.on( 'dblclick', function( e ) {
				Seiho.mm.application.Editor.stopEdit();
				// ..
				var t = tabPanel.getTabTarget( e );
				var a = tabPanel.getActiveTab();
				if( !t ) {					
					Seiho.mm.application.App.newCanvas();
				} else if( a.id != 'mm_home_tab' ) {									
					( function() { tabPanel.editTitle( t ) } ).defer( 10 );
				}
			}, this );

		},
		installElement: function() {
			var t = tabPanel.getActiveTab();
			if( t ) {
				// FIXME toolsProvider.getElement();
				new Seiho.mm.element.Window( t ).show();
			}
		},
        newCanvas    : function() {
            var m = new Ext.Panel({
                height: 150,
                layout: 'fit',
                border: false,
                region: 'south',
                title: 'Podgląd',
                iconCls: 'icon-magnifier'
            })
            var b = new Seiho.mm.tools.Toolbox({
                region: 'center',
                title: 'Narzędzia',
                iconCls: 'icon-application_osx_terminal'
            })
 
            var undoAction = new Ext.Action({
                disabled: true,
                iconCls: 'icon-arrow_undo',
                handler: function() { c.historyManager.undo() }
            })
            var redoAction = new Ext.Action({ 
                disabled: true,
                iconCls: 'icon-arrow_redo', 
                handler: function() { c.historyManager.redo() }
            })

			var c = new Seiho.mm.Canvas(
				{
					toolsProvider: toolsProvider,
					// ...
                    region: 'center',
                    border: false
				}
            );
            c.historyManager.on( 'change', function( h ) {
                undoAction.setDisabled( !h.canUndo() )   
                redoAction.setDisabled( !h.canRedo() )   
            })
            setInterval(function() {
                var el = Ext.get( c.body ).clone().removeClass( 'mm_canvas' );
                var svg = Ext.get( el.dom.firstElementChild )
        		var cx = [0, 0, 10000, 10000];
		        svg.set( { viewBox: cx.join( ' ' ) } )
                var items = m.items || new Ext.util.MixedCollection();
                items.each( function( c ) {
                    var item = c.getEl();
                    m.remove( c, true )
                    if( item ) {
                        item.remove()
                    }
                })
                m.add( new Ext.Panel({
                    border: false,
                    //html: '<div class="canvas-min">' + el + '</div>'
                    contentEl: el
                }))
                m.doLayout();
            }, 2000 )
            var t = new Ext.Panel({
    	    	title: 'Nowa Mapa ...',
				iconCls: 'icon-page_white',
				closable: true,
                layout: 'border',
                bbar: [
				    'autor: <a href="#">lech.twarog@gmail.com<a/>',
				    '->', {
					    iconCls: 'icon-disconnect'
				    }, ' '				
			    ],
                tbar: [
				' ',
				{
					xtype    : 'textfield',
					width    : 250,
					emptyText: 'Wyszukaj element ...',
                    listeners: {
						render: {
							fn: function (f) {
								f.el.on('keydown', b.filterTree, f, {
									buffer: 350
								});
							},
							scope: this
						}
					}
				}, ' ', ' ', {
					iconCls: 'icon-expand-all',
					tooltip: 'Rozwi\u0144 wszystkie',
					handler: function () {
						b.root.expand(true);
					},
					scope: this
				}, '-', {
					iconCls: 'icon-collapse-all',
					tooltip: 'Zwi\u0144 wszystkie',
					handler: function () {
						b.root.collapse(true);
					},
					scope: this
				},
                '->',
                undoAction,
                redoAction,
                '-',
                {
					iconCls: 'icon-application_get',
	//				handler: this.installWindow,
					scope  : this
				}, ' ', {
					iconCls: 'icon-application_lightning',
	//				handler: this.installLine,
					scope  : this
				},'-', {
					iconCls    : 'icon-tag_green',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_blue',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_purple',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_orange',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_pink',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_red',
					toggleGroup: 'colors'
				},{
					iconCls: 'icon-tag_yellow',
					toggleGroup: 'colors'
				},
				' '
	    		],
                items: [c, {
                    width: 210,
                    collapsible: false,
                    region: 'east',
                    margins: '1 1 1 1',
                    cmargins: '1 1 1 1',
                    split: false,
                    border: true,
                    layout: 'border',
                    items: [b, m]
                }]
            });
			tabPanel.add( t );
			tabPanel.setActiveTab( t );
			tabPanel.editTitle( t );
			// add test window
			//var w = new Seiho.mm.element.Window( t );
			//w.show();
			//Seiho.mm.application.App.installElement();
		},
		save        : function() {
			var t = tabPanel.getActiveTab();
			// TODO create isCanvas
			if( t.yeahItIsCanvas ) {
				var r = t.serialize();
				Ext.Ajax.request({
					url: '/map/save/' + Ext.util.JSON.encode( r )
				})
			}
		},
		close  : function() {
			var t = tabPanel.getActiveTab();
			// TODO create isCanvas
			if( t.yeahItIsCanvas ) {
				tabPanel.remove( t )
			}	
		},
		aboutUs: function() {
			if( this.aboutUsWindow ) {
				this.aboutUsWindow.toFront();
				this.aboutUsWindow.el.frame();
				return;
			}
				
			this.aboutUsWindow = new Ext.Window({
				width     : 480,
				height    : 400,
				autoLoad  : '/aboutUs.html',
				bodyStyle : 'padding:10px;background:white;',
				autoScroll: true,
				title     : 'O nas',
				iconCls   : 'icon-star',
				listeners : {
					close: {
						fn   : function( ) {
							this.aboutUsWindow = undefined;
						},
						scope: this
					}
				},
				buttons   : [
					{
						text   : 'Zamknij',
						iconCls: 'icon-cross',
						scope  : this,
						handler: function() {
							this.aboutUsWindow.close();
						}
					}
				]
			});

			this.aboutUsWindow.show();
		}
	}
}();
//}}}

Ext.onReady( Seiho.mm.application.App.init, Seiho.mm.application.App )
// vim: fdm=marker ai ts=4 sw=4 sts=4 et
