from django.conf.urls.defaults import patterns, include, url

from django.conf import settings

from django.contrib.auth.urls import urlpatterns as authpatterns
from novel.feeds import TweetFeed

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'novel.views.home', name='home'),
    
    url(r'^feed/$', TweetFeed()),
    
    url(r'^edit/$', 'novel.views.edit'),
    url(r'^edit/submit/$', 'novel.views.editsubmit'),
    url(r'^edit/inline/$', 'novel.views.editinline'),
    url(r'^edit/insert/$', 'novel.views.editinsert'),
    url(r'^edit/delete/$', 'novel.views.editdelete'),
    url(r'^edit/publish/$', 'novel.views.editpublish'),
    
    url(r'^schedule/$', 'novel.views.schedule'),
    
    url(r'^(?P<path>favicon.ico)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
    }),
    
    url(r'^login/', 'django.contrib.auth.views.login'),
    url(r'^logout/', 'django.contrib.auth.views.logout'),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
