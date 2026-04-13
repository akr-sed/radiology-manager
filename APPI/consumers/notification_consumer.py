import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'notifications_{self.user_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket connected for user {self.user_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected for user {self.user_id} with code {close_code}")

    async def receive(self, text_data):
        # Handle incoming messages if needed
        pass

    # Receive message from room group
    async def notification_message(self, event):
        message = event['message']
        notification_type = event.get('type_notification', 'general')
        notification_id = event.get('notification_id')
        patient_id = event.get('patient_id')
        rdv_id = event.get('rdv_id')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'type_notification': notification_type,
            'notification_id': notification_id,
            'patient_id': patient_id,
            'rdv_id': rdv_id,
        }))