from django.urls import path
from . import views
from django.conf import settings
from chat.views import index

urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth', views.auth, name = 'auth'),
    path('login', views.login, name = 'login'),
    path('categories_logged', views.login, name = 'logged'),
    path('', views.categories, name='categories'),
    path('chat/<int:helper_id>/', index, name='chat_view'),
]