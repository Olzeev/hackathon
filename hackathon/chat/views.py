from django.shortcuts import render, redirect
from django.http import JsonResponse
from categories.models import AdditionalInfo
from django.contrib.auth.models import User

def index(request, user_id):
    user = User.objects.get(id=user_id)
    info = AdditionalInfo.objects.get(user_id=user_id)
    
    return render(request, 'chat/chat.html', {'helper': user, 
                                              'categories': info.categories.all(), 
                                              'info': info})


def getUsername(request):
    if request.user.is_authenticated:
        return JsonResponse({"username": request.user.username})
    else:
        return JsonResponse({"username": '-anon-'})