# Create your views here.
from django.template import Context, loader, RequestContext
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from novel.models import Tweet
from novel import settings

def home(request):
    try:
        page = int(request.GET['page'])
    except (KeyError, ValueError):
        page = Tweet.objects.lastpage()
    if page < 0:
        return HttpResponseRedirect('/?page=1')
    lastPage = Tweet.objects.lastpage()
    if page > lastPage:
        return HttpResponseRedirect('/')
    t = loader.get_template('home.html')
    c = RequestContext(request,
        {
            'page': page,
            'lastpage': lastPage,
            'lines': Tweet.objects.page(page),
            'title': settings.TITLE,
        })
    return HttpResponse(t.render(c))

@login_required(login_url="/login/")
def edit(request):
    tweets = Tweet.objects.all()
    t = loader.get_template('novel/edit.html')
    c = RequestContext(request,
        {
            'tweets': tweets,
            'title': settings.TITLE,
        })
    return HttpResponse(t.render(c))

@login_required(login_url="/login/")
def editinline(request):
    try:
        text = request.POST['newcontent']
        id = request.POST['id']
    except KeyError:
        return HttpResponse("false")
    else:
        pass
    tweet = Tweet.objects.get(id=id)
    tweet.text = text
    tweet.save()
    return HttpResponse("true")

@login_required(login_url="/login/")
def editdelete(request):
    try:
        text = request.POST['textvalue']
        id = request.POST['id']
    except KeyError:
        return HttpResponse("false")
    else:
        pass
    tweet = Tweet.objects.get(id=id)
    if(tweet.text != text):
        return HttpResponse("false")
    tweet.delete()
    return HttpResponse("true")

@login_required(login_url="/login/")
def editinsert(request):
    try:
        id = request.POST['id']
    except KeyError:
        return HttpResponse("false")
    else:
        pass
    reftweet = Tweet.objects.get(id=id)
    
    newtweet = Tweet(text='new tweet', sort=(reftweet.sort))
    
    Tweet.objects.insert(newtweet)
    return HttpResponse(newtweet.id)
    #return HttpResponse("true")

@login_required(login_url="/login/")
def editpublish(request):
    try:
        text = request.POST['textvalue']
        id = request.POST['id']
    except KeyError:
        return HttpResponse("false")
    else:
        pass
    tweet = Tweet.objects.get(id=id)
    if(tweet.text != text):
        return HttpResponse("false")
    result = tweet.publish()
    return HttpResponse(str(result).lower())

@login_required(login_url="/login/")
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

@login_required(login_url="/login/")
def schedule(request):
    tweets = Tweet.objects.unpublished()
    t = loader.get_template('novel/schedule.html')
    c = RequestContext(request,
        {
            'tweets': tweets,
            'title': settings.TITLE,
        })
    return HttpResponse(t.render(c))
