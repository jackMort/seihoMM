# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User

class Map( models.Model ):
    name = models.CharField( "Nazwa mapy", max_length=30 )
    description = models.TextField( "Opis mapy" )
    users = models.ManyToManyField( User, through='Users' )
    private = models.BooleanField( "Prywatna" )
    date_added = models.DateTimeField( auto_now_add=True )

    class Meta:
        verbose_name = "Mapa"
        verbose_name_plural = "Mapy"
        get_latest_by = "date_added"

    def __unicode__( self ):
        return self.name

    def getAuthor( self ):
        for user in self.users.all():
            users = Users.objects.filter( map=self, user=user )
            for u in users:
                if u.author:
                    return user
        return None

    def isAuthor( self, user ):
        return self.getAuthor() == user

class User_Type( models.Model ):
    name = models.CharField( "User role", max_length=30 )
    description = models.TextField()
    
    class Meta:
        verbose_name = "Typ użytkownika"
        verbose_name_plural = "Typy użytkowników"

    def __unicode__( self ):
        return self.name

class Users( models.Model ):
    map = models.ForeignKey( Map, related_name='map' )
    user = models.ForeignKey( User )
    type = models.ForeignKey( User_Type )
    date_added = models.DateTimeField( auto_now_add=True )
    author = models.BooleanField()
    
    class Meta:
        verbose_name = "Użytkownicy"
        verbose_name_plural = "Użytkownicy"

# vim: fdm=marker ts=4 sw=4 sts=4
