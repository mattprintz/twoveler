from django.conf.urls import patterns, include, url

urlpatterns = patterns('novel.views',
    url(r'^$', 'novel'),
    #url(r'^login/', 'login'),
    url(r'^edit/', 'edit'),
    #url(r'^submit/', 'submit'),
)
