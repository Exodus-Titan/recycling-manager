from rest_framework import serializers
from ..models import OriginAddress

class OriginAddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = OriginAddress
        fields = ('id','address', 'city', 'state')
