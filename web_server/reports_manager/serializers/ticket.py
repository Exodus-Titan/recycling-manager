from rest_framework import serializers
from ..models import Ticket
from .ticket_item import TicketItemSerializer


class TicketSerializer(serializers.ModelSerializer):
    items = TicketItemSerializer(many=True, read_only=True)
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ('id','ticket_number', 'date', 'employee_name', 'total_weight', 'installment_amount', 'items', 'provider', 'provider_name')
        read_only_fields = ('creation_date',)

    def get_provider_name(self, obj):
    # 'obj' es la instancia de Address. Accedemos al objeto Provider relacionado.
        if obj.provider:
            return f"{obj.provider.name} - {obj.provider.id_number}"
        return "Sin proveedor"
    