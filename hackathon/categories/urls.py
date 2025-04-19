from django.urls import path, include
from . import views
from django.conf import settings
from chat.views import index

urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth/', views.auth, name = 'auth'),
    path('register_view', views.register_view, name = "register_view"),
    path('chat/<int:helper_id>/', index, name='chat_view'),
    path('accounts/', include('django.contrib.auth.urls')),
]