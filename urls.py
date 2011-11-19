from django.conf.urls.defaults import patterns, include, url

from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'novel.views.home', name='home'),
    url(r'^edit/$', 'novel.views.edit'),
    url(r'^edit/submit/$', 'novel.views.editsubmit'),
    url(r'^edit/inline/$', 'novel.views.editinline'),
    url(r'^(?P<path>favicon.ico)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
    }),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
