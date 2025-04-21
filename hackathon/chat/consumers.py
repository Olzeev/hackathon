# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # стандартная группа
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # добавляемся в группу и принимаем соединение
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # уведомляем всех в комнате о новом зрителе
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_sdp',         # вызовёт метод send_sdp ниже
                'data': {
                    'type': 'new-viewer',
                    'from': None,
                    'data': None
                }
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # расширяем данными канала
        data['channel'] = self.channel_name

        # ретранслируем всем, включая стримера и зрителей
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_sdp',
                'data': data,
            }
        )

    # все события приходят сюда
    async def send_sdp(self, event):
        await self.send(text_data=json.dumps(event['data']))
