from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, logout, login

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