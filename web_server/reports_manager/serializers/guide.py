from rest_framework import serializers 
from ..models import Guide

class GuideSerializer(serializers.ModelSerializer):
    ticket_display = serializers.SerializerMethodField()

    class Meta:
        model = Guide
        fields = ('id','status', 'date', 'ticket', 'inspection_record_number', 'ticket_display')
        read_only_fields = ('creation_date',)

    def get_ticket_display(self, obj):
        # Si la guía tiene un ticket asociado, devolvemos el formato deseado
        if obj.ticket:
            return f"Ticket - N.º {obj.ticket.ticket_number}"
        return "Sin Ticket"