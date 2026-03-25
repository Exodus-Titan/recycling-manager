from rest_framework import serializers
from ..models import TicketItem

class TicketItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketItem
        fields = ('id','report', 'material', 'amount', 'unit_type')