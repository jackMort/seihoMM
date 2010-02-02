from django.contrib import admin
from reversion.admin import VersionAdmin
from seihoMM.map.models import Map, Users, User_Type

class UsersInline( admin.TabularInline ):
    model = Users
    extra = 1

class MapAdmin( VersionAdmin ):
    inlines = ( UsersInline, )
    list_display = ( 'name','description', 'date_added', 'private' )
    list_filter = ( 'private', 'date_added' )

class User_TypeAdmin( VersionAdmin ):
    list_display = ( 'name','description' )

admin.site.register( Map, MapAdmin )
admin.site.register( User_Type, User_TypeAdmin )
