from rest_framework import serializers
from ..models import VehiclePhoto

class VehiclePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = ('id', 'vehicle', 'photo')

        