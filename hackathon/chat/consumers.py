import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # имя комнаты без префикса «chat_» — понадобится в БД
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room, self.channel_name)
        await self.accept()

        # отправляем истoрию (последние 100) ТОЛЬКО новому клиенту
        history = await self.get_history()
        for item in history:
            await self.send(text_data=json.dumps(
                {"type": "chat", "payload": item.content}
            ))

    # ---------- приём сообщений ----------
    async def receive(self, text_data):
        msg = json.loads(text_data)

        # сохраняем только реальные сообщения чата
        if msg.get('type') == 'chat':
            await self.save_message(msg)

        # ретранслируем, как и раньше
        await self.channel_layer.group_send(
            self.room,
            {"type": "broadcast", "message": msg}
        )

    async def broadcast(self, event):
        await self.send(text_data=json.dumps(event['message']))

    # ---------- DB helpers ----------
    @database_sync_to_async
    def get_history(self):
        """Список 100 последних сообщений (от старых к новым)."""
        qs = ChatMessage.objects.filter(room=self.room_name) \
                                .order_by('-created')[:100]
        return list(reversed(qs))

    @database_sync_to_async
    def save_message(self, msg):
        # пишем сообщение
        ChatMessage.objects.create(
            room=self.room_name,
            author_id=msg.get('from'),
            content=msg['payload']
        )
        # держим только 100 последних
        extra = ChatMessage.objects.filter(room=self.room_name) \
                                   .order_by('-created')[100:]
        if extra.exists():
            extra.delete()
