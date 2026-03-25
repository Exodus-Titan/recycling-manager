"""
URL configuration for ticket_manager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from reports_manager import views

router = routers.DefaultRouter()
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'addresses', views.AddressViewSet)
router.register(r'affidavits', views.AffidavitViewSet)
router.register(r'companies', views.CompanyViewSet)
router.register(r'delivery-notes', views.DeliveryNoteViewSet)
router.register(r'guides', views.GuideViewSet)
router.register(r'materials', views.MaterialViewSet)
router.register(r'providers', views.ProviderViewSet)
router.register(r'tickets', views.TicketViewSet)
router.register(r'ticket-items', views.TicketItemViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
