from rest_framework import serializers
from ..models import Address

class AddressSerializer(serializers.ModelSerializer):
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Address
        fields = ('id','address', 'city', 'state', 'provider', 'provider_name')

    def get_provider_name(self, obj):
    # 'obj' es la instancia de Address. Accedemos al objeto Provider relacionado.
        if obj.provider:
            return f"{obj.provider.name} - {obj.provider.id_number}"
        return "Sin proveedor"