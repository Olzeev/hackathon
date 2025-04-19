from django.urls import path
from . import views

urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth', views.auth, name = 'auth'),
    path("register_view", views.register_view , name= 'register_view'),
    path('login', views.login, name = 'login'),
    path('categories_logged', views.logged, name = 'logged'),
    path('', views.categories, name='categories'),
]