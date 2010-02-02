from django.test import TestCase
from django.contrib.auth.models import User
from seihoMM.map.models import Map, User_Type, Users

class MapTestCase( TestCase ):
    def setUp( self ):
        self.map1 = Map.objects.create( name="testowa1", description="testowa1 desc" )

        self.user1 = User.objects.create_user( 'jack', 'jack@test.com', 'secret' )
        self.user2 = User.objects.create_user( 'vladimir', 'vladimir@test.com', 'secret2' )

        t1 = User_Type.objects.create( name='admin' )
        t2 = User_Type.objects.create( name='bot' )

        Users( map=self.map1, user = self.user1, type = t1, author=True ).save()
        Users( map=self.map1, user = self.user2, type = t2 ).save()

    def testUsers( self ):
        self.assertEquals( self.map1.users.count(), 2 )

    def testGetAuthor( self ):
        self.assertEquals( self.map1.getAuthor(), self.user1 )
        self.assertNotEquals( self.map1.getAuthor(), self.user2 )

    def testIsAuthor( self ):
        self.assert_( self.map1.isAuthor( self.user1 ) )
        self.assertFalse( self.map1.isAuthor( self.user2 ) )

# vim: fdm=marker ts=4 sw=4 sts=4
