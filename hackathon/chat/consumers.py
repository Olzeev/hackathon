import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room = f"chat_{self.scope['url_route']['kwargs']['room_name']}"
        await self.channel_layer.group_add(self.room, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room, self.channel_name)

    async def receive(self, text_data):
        msg = json.loads(text_data)
        # ретранслируем всем в группе
        await self.channel_layer.group_send(
            self.room,
            {
                'type': 'broadcast',
                'message': msg
            }
        )

    async def broadcast(self, event):
        await self.send(text_data=json.dumps(event['message']))