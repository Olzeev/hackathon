from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, logout, login
from django.http import JsonResponse

# Create your views here.
def index(request):
    return render(request, 'chat/chat.html')

def login_user(request):
    user = authenticate(request, username="olzeev", password="092531")
    if user is not None:
        # A backend authenticated the credentials
        login(request, user)
    else:
        # No backend authenticated the credentials
        ...
    return redirect('main')

def logout_user(request):
    logout(request)
    return redirect('main')

def getUsername(request):
    if request.user.is_authenticated:
        return JsonResponse({"username": request.user.username})
    else:
        return JsonResponse({"username": '-anon-'})