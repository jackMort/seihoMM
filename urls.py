import os

from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^media/(.*)$', 'django.views.static.serve', { 'document_root' : os.path.join( os.path.dirname( __file__ ), 'media' ) } ),
    url(r'^/?$', 'django.views.generic.simple.direct_to_template', { 'template' : 'index.html' }, name='index' ),
    url(r'^welcome.html$', 'django.views.generic.simple.direct_to_template', { 'template' : 'welcome.html' }),
    url(r'^aboutUs.html$', 'django.views.generic.simple.direct_to_template', { 'template' : 'aboutUs.html' }),
 
    url(r'^map/export/(?P<svg>.*)$', 'map.views.export_svg' ),
    url(r'^map/save/(?P<json>.*)$', 'map.views.save_json' ),
    url(r'^map/load/(?P<id>\w+)$', 'map.views.load_map' ),

    url(r'^admin/', include(admin.site.urls))
)

# vim: fdm=marker ai ts=4 sw=4 sts=4 et
