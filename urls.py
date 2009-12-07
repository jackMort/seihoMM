import os

from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^seiho/', include('seiho.foo.urls')),

    (r'^media/(.*)$', 'django.views.static.serve', { 'document_root' : os.path.join( os.path.dirname( __file__ ), 'media' ) } ),
    url(r'^/?$', 'django.views.generic.simple.direct_to_template', { 'template' : 'index.html' }, name='index' ),
    url(r'^welcome.html$', 'django.views.generic.simple.direct_to_template', { 'template' : 'welcome.html' }),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    (r'^admin/', include(admin.site.urls)),
)
