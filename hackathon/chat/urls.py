from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('chat/getUsername', views.getUsername, name='getUsername'), 
    path('<int:user_id>/', views.index, name='chat-view')
]