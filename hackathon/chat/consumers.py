import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async

channel_layer = get_channel_layer()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await channel_layer.send(self.channel_name, {
            "type": "send.sdp",
            "data": {'channel': self.channel_name},
        })
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data_json = json.loads(text_data)
        print("#######", data_json)
        # message = data_json.get('message')
        # action = data_json.get('action')
        #
        # if action == 'call':
        #     channel_name, res_data = await self.call(message)
        #     await channel_layer.send(channel_name, res_data)
        #     return

        data_json['channel'] = self.channel_name
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send.sdp',
                'data': data_json,
            }
        )

    async def send_sdp(self, event):
        receive = event['data']
        await self.send(text_data=json.dumps(receive))