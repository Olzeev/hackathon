from django.urls import path
from . import views

urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth', views.auth, name = 'auth'),
    path('login', views.login, name = 'login'),
    path('categories_logged', views.login, name = 'logged'),
    path('', views.categories, name='categories'),
]