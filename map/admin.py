from django.contrib import admin
from reversion.admin import VersionAdmin
from seihoMM.map.models import Map

class MapAdmin( VersionAdmin ):
    list_display = ( 'name','description', 'date_added', 'private' )
    list_filter = ( 'private', 'date_added' )
    
admin.site.register( Map, MapAdmin )
