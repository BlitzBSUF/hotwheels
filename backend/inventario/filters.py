import django_filters
from .models import HotWheel


class HotWheelFilter(django_filters.FilterSet):
    precio_min = django_filters.NumberFilter(field_name='precio_venta', lookup_expr='gte')
    precio_max = django_filters.NumberFilter(field_name='precio_venta', lookup_expr='lte')
    en_stock = django_filters.BooleanFilter(method='filtrar_stock')

    class Meta:
        model = HotWheel
        fields = {
            'anio': ['exact'],
            'serie': ['exact'],
            'serie__linea': ['exact'],
            'modelo': ['exact'],
            'modelo__marca': ['exact'],
            'color': ['exact'],
            'tipo': ['exact'],
            'estado': ['exact'],
        }

    def filtrar_stock(self, queryset, name, value):
        return queryset.filter(cantidad__gt=0) if value else queryset