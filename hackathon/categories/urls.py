from django.urls import path, include
from . import views
from django.conf import settings

urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth/', views.auth, name = 'auth'),
    path('register_view', views.register_view, name = "register_view"),
    path('chat/<int:helper_id>/', views.redirect_to_chat, name='redirect_to_chat'),
    path('accounts/', include('django.contrib.auth.urls')),
]