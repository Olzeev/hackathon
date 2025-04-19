from django.urls import path
from . import views
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('', views.index, name='main'), 
    # login-section
    path('login', views.login_user, name='login'),
    path('logout', views.logout_user, name='logout'),
]