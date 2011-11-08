# Create your views here.
from django.template import Context, loader, RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from novel.models import Tweet
from novel import settings

def home(request):
    lines = Tweet.objects.filter(published=True)
    t = loader.get_template('home.html')
    c = Context({
        'lines': lines,
        'title': settings.TITLE,
    })
    return HttpResponse(t.render(c))

@login_required(login_url="/admin/")
def edit(request):
    tweets = Tweet.objects.all()
    t = loader.get_template('novel/edit.html')
    c = RequestContext(request,
        {
            'tweets': tweets,
            'title': settings.TITLE,
        })
    return HttpResponse(t.render(c))

@login_required()
def editinline(request):
    try:
        text = request.POST['newcontent']
        id = request.POST['id']
    except KeyError:
        return HttpResponse("fail")
    else:
        pass
    return HttpResponse('test')

@login_required(login_url="/admin/")
def editsubmit(request):
    try:
        text = request.POST['newcontent']
    except KeyError:
        return HttpResponse("fail")
    else:
        lines = text.split("\n")
        for line in lines:
            if line.rstrip() == "":
                continue
            t = Tweet(None, line.rstrip())
            t.save()
        return HttpResponseRedirect('/edit/')
