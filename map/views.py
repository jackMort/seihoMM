import base64
from django.http import HttpResponse

def export_svg( request, svg=None ):
    response = HttpResponse( mimetype='application/svg' )
    response['Content-Disposition'] = 'attachment; filename=map.svg'
    
    att = '<?xml version="1.0"?>%s' % base64.decodestring( svg )

    response.write( att )
    return response

# vim: fdm=marker ai ts=4 sw=4 sts=4 et
