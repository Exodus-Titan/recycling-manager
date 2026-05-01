from rest_framework import serializers
from ..models import DeliveryNoteItem

class DeliveryNoteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryNoteItem
        fields = ('id','delivery_note', 'material', 'amount', 'unit_type')