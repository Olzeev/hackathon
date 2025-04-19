from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, logout, login
from django.http import JsonResponse
from categories.models import Helper

# Create your views here.
def index(request, user_id):
    user = Helper.objects.get(id=user_id)
    
    return render(request, 'chat/chat.html', {'helper': user, 'categories': user.categories.all()})


def getUsername(request):
    if request.user.is_authenticated:
        return JsonResponse({"username": request.user.username})
    else:
        return JsonResponse({"username": '-anon-'})