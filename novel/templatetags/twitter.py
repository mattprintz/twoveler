from django import template
from novel import settings

register = template.Library()

@register.simple_tag
def twitter_button():
    html = """<a href="https://twitter.com/%s" class="twitter-follow-button" data-show-count="false" data-align="center">Follow @%s</a>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>"""
    return html % (settings.TWITTER_NAME, settings.TWITTER_NAME)

@register.simple_tag
def twitter_link():
    html = """<a href="https://twitter.com/%s">@%s</a>"""
    return html % (settings.TWITTER_NAME, settings.TWITTER_NAME)
