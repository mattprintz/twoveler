from django.core.management.base import BaseCommand, CommandError
from novel import settings
from novel.models import Tweet

class Command(BaseCommand):
    args = ''
    help = ''

    def handle(self, *args, **options):
        tweet = Tweet.objects.getNextToPublish()
        if tweet:
            tweet.publish()
