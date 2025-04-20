from django.urls import path , include
from chat import consumers

# Here, "" is routing to the URL ChatConsumer which 
# will handle the chat functionality.
websocket_urlpatterns = [
    path('chat/<str:room_name>', consumers.ChatConsumer.as_asgi()),
] 