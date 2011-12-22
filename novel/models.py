from django.db import models
import twitter
from novel import settings

PAGEHEIGHT = 20

def defaultSortTweet():
    try:
        return int(Tweet.objects.order_by('sort').reverse()[0].sort) + 1
    except IndexError:
        return 1

class TweetManager(models.Manager):
    
    def insert(self, tweet):
        sortpos = tweet.sort
        resort = True
        try:
            if sortpos >= Tweet.objects.order_by('sort').reverse()[0].sort:
                tweet.sort = defaultSortTweet()
                resort = False
        except IndexError:
            tweet.sort = defaultSortTweet()
        else:
            if resort:
                from django.db import connection
                cursor = connection.cursor()
                cursor.execute("""
                    UPDATE novel_tweet
                    SET sort = (sort + 1)
                    where sort >= %s
                    ORDER BY sort DESC
                    """ % sortpos)
        finally:
            tweet.save()
    
    def published(self):
        return Tweet.objects.filter(published=True)
    
    def unpublished(self):
        return Tweet.objects.filter(published=False)
    
    def lastpage(self):
        count = Tweet.objects.published().count()
        if count % PAGEHEIGHT == 0:
            return ( count / PAGEHEIGHT)
        else:
            return ( count / PAGEHEIGHT) + 1
    
    def page(self, page_num):
        if int(page_num) <= 0:
            page_num = 1
        start = (int(page_num) - 1) * PAGEHEIGHT
        return Tweet.objects.published()[start:start+PAGEHEIGHT]
    
    def resort(self):
        count = 1
        tweets = Tweet.objects.all()
        for tweet in tweets:
            tweet.sort = count
            count += 1
            tweet.save()

class Tweet(models.Model):
    
    class Meta:
        verbose_name = "Tweet"
        verbose_name_plural = 'Tweets'
        ordering = ('sort', 'id',)
    
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=140)
    published = models.BooleanField(default=False)
    sort = models.PositiveIntegerField('Sort', unique=True, default=defaultSortTweet, db_index=True)
    scheduled_time = models.DateTimeField('DateTime scheduled', null=True, blank=True)
    published_time = models.DateTimeField('DateTime published', null=True, blank=True)
    twitter_id = models.BigIntegerField('Twitter ID', null=True, blank=True)
    
    objects = TweetManager()
    
    def __unicode__(self):
        return self.text
    
    def publish(self):
        from datetime import datetime
        
        api = twitter.Api(
            settings.TWITTER_CONSUMER_KEY,
            settings.TWITTER_CONSUMER_SECRET,
            settings.TWITTER_ACCESS_TOKEN_KEY,
            settings.TWITTER_ACCESS_TOKEN_SECRET
        )
        
        api.VerifyCredentials()
        result = api.PostUpdate(self.text)
        
        if result.GetCreatedAt():
            self.published = True
            self.published_time = datetime.fromtimestamp(result.GetCreatedAtInSeconds())
            self.twitter_id = result.GetId()
            self.save()
            return True
        return False
