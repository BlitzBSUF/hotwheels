from django.contrib import admin
from .models import Linea, Serie, Marca, Modelo, Color, Tipo, HotWheel, MovimientoStock

admin.site.register([Linea, Serie, Marca, Modelo, Color, Tipo, MovimientoStock])


@admin.register(HotWheel)
class HotWheelAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'color', 'tipo', 'cantidad', 'precio_venta', 'estado')
    list_filter = ('anio', 'serie__linea', 'tipo', 'estado')
    search_fields = ('modelo__nombre', 'codigo_barras', 'codigo_producto')