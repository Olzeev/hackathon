from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, logout, login
from django.http import JsonResponse

# Create your views here.
def index(request):
    return render(request, 'chat/chat.html')


def getUsername(request):
    if request.user.is_authenticated:
        return JsonResponse({"username": request.user.username})
    else:
        return JsonResponse({"username": '-anon-'})