/**
 * seiho.mm.tools.js
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
	'Seiho.mm.tools'
);
// ...................
Seiho.mm.tools.Toolbox = Ext.extend( Ext.tree.TreePanel, { //{{{
	margins: "1 0 5 5",
	cmargins: "1 0 5 5",
	width: 300,
	border: false,
	region: "west",
	split: true,
	layout: "fit",
	collapsible: true,
	rootVisible: false,
	animate: false,
	autoScroll: true,
	useArrows: true,
	minWidth: 150,
	enableDrag: true,
	collapseFirst: false,
	animCollapse: false,
	animFloat: false,
	initComponent: function () {
		this.loader = new Seiho.mm.tools.Toolbox.Loader();
		this.root = {
			id: "troot",
			async: true,
			expanded: true,
			text: "troot"
		};

		var tree = this;
		// filter
		var filter = new Ext.tree.TreeFilter(tree, {
			clearBlank: true,
			autoClear: true
		});

		var hiddenPkgs = [];

		function filterTree(e) {
			var text = e.target.value;
			Ext.each(hiddenPkgs, function (n) {
				n.ui.show();
			});
			if (!text) {
				filter.clear();
				return;
			}
			tree.expandAll();

			// var re = new RegExp('^' + Ext.escapeRe(text), 'i');
			var re = new RegExp(Ext.escapeRe(text), 'i');
			filter.filterBy(function (n) {
				return (!n.isLeaf() || re.test(n.text));
			});
		}
		Ext.apply(this, {
			tbar: new Ext.Toolbar({
				cls: 'top-toolbar',
				items: [' ', new Ext.form.TextField({
					width: 200,
					emptyText: 'Wyszukaj element',
					listeners: {
						render: {
							fn: function (f) {
								f.el.on('keydown', filterTree, f, {
									buffer: 350
								});
							},
							scope: this
						}
					}
				}), ' ', ' ', {
					iconCls: 'icon-expand-all',
					tooltip: 'Rozwi\u0144 wszystkie',
					handler: function () {
						this.root.expand(true);
					},
					scope: this
				}, '-', {
					iconCls: 'icon-collapse-all',
					tooltip: 'Zwi\u0144 wszystkie',
					handler: function () {
						this.root.collapse(true);
					},
					scope: this
				}]
			})
		});

		Seiho.mm.tools.Toolbox.superclass.initComponent.call(this);
		this.getSelectionModel().on("beforeselect", function (a, b) {
			if (b && !b.isLeaf()) {
				b.toggle();
				return false
			}
		});
	}
});
//}}}
Seiho.mm.tools.Toolbox.Loader = Ext.extend( Ext.tree.TreeLoader, { //{{{
	load: function (a, k) {
		if (a.id != "troot") {
			k();
			return
		}
		var l = a.getOwnerTree();
		a.beginUpdate();
		var j = Seiho.mm.tools.Registry.all.items;
		for (var b = 0, d = j.length, g, f, e; b < d; b++) {
			f = j[b];
			e = "xdc" + f.prototype.category.replace(/\s/g, "_");
			g = l.getNodeById(e);
			if (!g) {
				g = a.appendChild({
					cls: "toolbox-ct",
					allowDrag: false,
					text: f.prototype.category,
					id: e,
					leaf: false
				})
			}
			var h = new Ext.tree.TreeNode({
				text: f.prototype.text,
				qtipCfg: {
					title: f.prototype.text,
					text: f.prototype.description
				},
				iconCls: f.prototype.iconCls || 'page',
				leaf: true
			});
			g.appendChild(h);
			h.type = f;
			h.instance = new f()
		}
		//       l.loadUserTypes();
		a.endUpdate();
		a.expand.defer(10, a, [true]);
		k();
	}
});
//}}}
Seiho.mm.tools.Registry = function () { //{{{
	var a = new Ext.util.MixedCollection(true, function (d) {
		return d.prototype.cid
	});
	var b = Ext.extend(Ext.data.JsonStore, {
		constructor: function () {
			b.superclass.constructor.call(this, {
				id: "cid",
				fields: [{
					name: "id",
					mapping: "cid"
				},
				"xtype", "text", "iconCls", "category"]
			})
		}
	});
	var c = null;
	return {
		register: function (f) {
			a.add(f);
			f.prototype.__xdclass = f;
			var g = f.prototype.configs || [];
			f.prototype.configs = f.configs = new Ext.util.MixedCollection(false, function (h) {
				return h.name
			});
			// register as xtype
			Ext.reg('DST__' + f.prototype.cid, f);
		},
		unregister: function (d) {
			a.remove(d)
		},
		get: function (d) {
			return a.get(d)
		},
		all: a,
		createStore: function (g) {
			if (!c) {
				c = [];
				for (var e = 0, d = a.items.length; e < d; e++) {
					c.push(a.items[e].prototype)
				}
			}
			var f = new b();
			f.loadData(c);
			//if (g) {
			//	f.filter("isVisual", true)
			//}
			return f
		}
	}
} ();
//}}}
// vim: fdm=marker ts=4 sw=4 sts=4
