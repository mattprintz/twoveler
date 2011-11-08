from django.db import models

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
    
    #def resort(self):
    #    from django.db import connection
    #    cursor = connection.cursor()
    #    cursor.execute("""
    #        CREATE TEMP TABLE tempsort AS
    #        SELECT id, text, published, scheduled_time, published_time
    #        FROM novel_tweet
    #        ORDER BY sort
    #        """)

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
    
    objects = TweetManager()
    
    def __unicode__(self):
        return self.text
    
    def publish(self):
        import datetime
        self.published = True
        self.published_time = datetime.datetime.now()
        self.save()
