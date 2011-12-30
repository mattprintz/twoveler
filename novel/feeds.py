from novel.models import Tweet
from novel import settings
from django.contrib.syndication.views import Feed


class TweetFeed(Feed):
    title = settings.TITLE
    link = "/"
    description = "%s feed" % (settings.TITLE,)
    
    def items(self):
        return Tweet.objects.published().order_by('-published_time')[:20]
    
    def item_title(self, item):
        return item.text
    
    def item_description(self, item):
        return item.text
    
    def item_link(self, item):
        return "%s?page=%d&id=%d" % (self.link, Tweet.objects.getPage(item), item.id)
    
    def item_pubdate(self, item):
        return item.published_time
