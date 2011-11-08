from novel.models import Tweet
from django.contrib import admin

class TweetAdmin(admin.ModelAdmin):
    list_display = ('text', 'published',)
    ordering = ('sort',)

admin.site.register(Tweet, TweetAdmin)
