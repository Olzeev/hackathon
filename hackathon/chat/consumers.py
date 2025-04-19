import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.roomGroupName = "test-room"
        await self.channel_layer.group_add(
            self.roomGroupName ,
            self.channel_name
        )
        await self.accept()
    async def disconnect(self , close_code):
        await self.channel_layer.group_discard(
            self.roomGroupName , 
            self.channel_name 
        )
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        action = text_data_json['action']

        if (action == 'new-offer') or (action == 'new-answer'):
            receiver_channel_name = text_data_json['message']['receiver_channel_name']

            receiver_channel_name['message']['receiver_channel_name'] = self.channel_name
            await self.channel_layer.send(
                receiver_channel_name,
                {
                    "type" : "send.sdp" ,
                    'receive_dict': text_data_json
                }
            )


        text_data_json['message']['receiver_channel_name'] = self.channel_name

        await self.channel_layer.group_send(
            self.roomGroupName,
            {
                "type" : "send.sdp" ,
                'receive_dict': text_data_json
            })
    async def send_sdp(self , event) : 
        receive_dict = event["receive_dict"]
        
        await self.send(text_data = json.dumps(receive_dict))
      