from django.urls import path
from . import views
from django.conf import settings
from chat.views import index

urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth', views.auth, name = 'auth'),
    path("register_view", views.register_view , name= 'register_view'),
    path('login', views.login, name = 'login'),
    path('categories_logged', views.logged, name = 'logged'),
    path('', views.categories, name='categories'),
    path('succesful_login', views.succesful_login, name = 'succesful_login'),
    path('chat/<int:helper_id>/', views.redirect_to_chat, name='redirect_to_chat'),
]