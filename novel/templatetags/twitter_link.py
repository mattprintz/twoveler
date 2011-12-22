from django import template
from novel import settings

register = template.Library()

@register.simple_tag
def twitter_link():
    html = """<a href="https://twitter.com/%s">@%s</a>"""
    return html % (settings.TWITTER_NAME, settings.TWITTER_NAME)
