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
					text   : 'Instaluj okno',
					handler: this.installWindow,
					scope  : this
				}, ' ', {
					iconCls: 'icon-application_lightning',
					text   : 'Instaluj linię',
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
		return new Seiho.mm.element.Line( c );
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
	/*
	var loginAction = new Ext.Action({
		iconCls: 'icon-user_go',
		text   : 'Logowanie'
	});
	var registerAction = new Ext.Action({
		iconCls: 'icon-user_add',
		text   : 'Rejestracja'
	});
	*/
	var toolsProvider = new Seiho.mm.application.ToolsProvider(); 	
	var tabPanel      = new Seiho.mm.application.TabPanel({
		tbar: toolsProvider
		/*,bbar: [
			'->',
			loginAction,
			'-',
			registerAction,
			' '
		]*/
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
													{ text: 'Zamknij', iconCls: 'icon-cross' }
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
													{ text: 'Ustawienia', iconCls: 'icon-page_white_gear' }
												]
										},{
											text     : 'Widok',
											iconCls  : 'icon-page_white',
											menu     : 
												[
													{ text: 'Nowy ...'}
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
							'<div id="seiho-text"><img src="/media/images/logo.png"/><!--span class="highlight">seiho</span>MindMapper <span class="beta">DEVELOPMENT PREVIEW</span--></div>'
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
			var t = new Seiho.mm.Canvas(
				{
					toolsProvider: toolsProvider,
					// ...
					title   : 'Nowa Mapa ...',
					iconCls : 'icon-page_white',
					closable: true
				}
			);
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
				// TODO serializers
				console.log( r );				
			}
		},
		aboutUs: function() {
			if( this.aboutUsWindow ) {
				this.aboutUsWindow.toFront();
				this.aboutUsWindow.el.frame();
				return;
			}
				
			this.aboutUsWindow = new Ext.Window({
				width     : 500,
				height    : 300,
				autoLoad  : '/welcome.html',
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
				}
			});

			this.aboutUsWindow.show();
		}
	}
}();
//}}}

Ext.onReady( Seiho.mm.application.App.init, Seiho.mm.application.App )
// vim: fdm=marker ts=4 sw=4 sts=4
