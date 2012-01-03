from django import template
from novel import settings
from novel.models import Tweet

register = template.Library()

@register.simple_tag
def copyright():
    (start, end) = Tweet.objects.years()
    html = """&copy; %s-%s <a href="http://twitter.com/%s">@%s</a>""" % (start, end, settings.TWITTER_NAME, settings.TWITTER_NAME)
    return html
