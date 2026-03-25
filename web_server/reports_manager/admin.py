from django.contrib import admin
from .models import Material, Ticket, TicketItem, Address, Provider, Vehicle, Company, Guide, Affidavit, DeliveryNote

# Inlines existentes
class ItemTicketInline(admin.TabularInline):
    model = TicketItem
    extra = 1

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    inlines = [ItemTicketInline]
    list_display = ('ticket_number', 'provider', 'date', 'total_weight')

# Registros simples
admin.site.register(Material)
admin.site.register(Address)
admin.site.register(Provider)
admin.site.register(Vehicle)
admin.site.register(Company)
admin.site.register(Guide)
admin.site.register(Affidavit)
admin.site.register(DeliveryNote)