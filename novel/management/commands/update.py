from django.core.management.base import BaseCommand, CommandError
import twitter
from datetime import datetime
from novel import settings

class Command(BaseCommand):
    args = ''
    help = ''

    def handle(self, *args, **options):
        api = twitter.Api(
            settings.TWITTER_CONSUMER_KEY,
            settings.CONSUMER_SECRET,
            settings.ACCESS_TOKEN_KEY,
            settings.ACCESS_TOKEN_SECRET
        )
        api.VerifyCredentials()
        
        posts = Line.objects.filter(published=False).exclude(schedule_time__lt=datetime(2000,1,1)).filter(schedule_time__lte=datetime.now())
        
        for post in posts:
            api.PostUpdate(post.tweet)
            post.published = True
            post.publish_time = datetime.now()
            post.save()

