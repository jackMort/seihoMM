import base64
from django.http import HttpResponse
from django.utils import simplejson
from django.core import serializers
from seihoMM.map.models import Map, User_Type, Users, Element_Param, Element

def export_svg( request, svg=None ):
    response = HttpResponse( mimetype='application/svg' )
    response['Content-Disposition'] = 'attachment; filename=map.svg'
    
    att = '<?xml version="1.0"?>%s' % base64.decodestring( svg )

    response.write( att )
    return response

def save_json( request, json, id=None ):
    obj = simplejson.loads( json )
    
    map = Map.objects.create( name=obj['name'] )
    for el in obj['items']:
        element = Element.objects.create()
        for key in el.keys():
            element.params.add(
                Element_Param.objects.create( name=key, value=el[key] )
            )
        map.elements.add( element )
        map.save()

    return HttpResponse( 'OK' )

def load_map( request, id=1 ):
    data = serializers.serialize( 'json', [Map.objects.get(id=id )] )
    return HttpResponse( data )

# vim: fdm=marker ai ts=4 sw=4 sts=4 et
