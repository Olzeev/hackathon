from django.urls import path
from . import views
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('', views.index, name='main'), 
    path('getUsername', views.getUsername, name='getUsername')
]