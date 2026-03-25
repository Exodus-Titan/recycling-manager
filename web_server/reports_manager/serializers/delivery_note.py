from rest_framework import serializers
from ..models import DeliveryNote

class DeliveryNoteSerializer(serializers.ModelSerializer):
    ticket_display = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    creation_date = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    startdate = serializers.DateTimeField(format="%Y-%m-%d")
    enddate = serializers.DateTimeField(format="%Y-%m-%d")

    class Meta:
        model = DeliveryNote
        fields = ('id','company', 'ticket', 'provider', 'truck_brand', 'truck_model', 'truck_plate', 'truck_color',
                  'start_address', 'start_city', 'start_state', 'end_address', 'end_city', 'end_state', 'creation_date', 'startdate', 'enddate',
                  'provider_name', 'ticket_display')
        read_only_fields = ('creation_date',)

    def get_ticket_display(self, obj):
        # Si la guía tiene un ticket asociado, devolvemos el formato deseado
        if obj.ticket:
            return f"Ticket - N.º {obj.ticket.ticket_number}"
        return "Sin Ticket"
    
    def get_provider_name(self, obj):
    # 'obj' es la instancia de Address. Accedemos al objeto Provider relacionado.
        if obj.provider:
            return f"{obj.provider.name} - {obj.provider.id_number}"
        return "Sin proveedor"