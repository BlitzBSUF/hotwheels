from rest_framework import serializers
from .models import (
    Linea, Serie, Marca, Modelo, Color, Tipo, HotWheel, MovimientoStock
)


class LineaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Linea
        fields = '__all__'


class SerieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Serie
        fields = '__all__'


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'


class ModeloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modelo
        fields = '__all__'


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = '__all__'


class TipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo
        fields = '__all__'


class HotWheelSerializer(serializers.ModelSerializer):
    # campos legibles para mostrar en el frontend
    linea_nombre = serializers.CharField(source='serie.linea.nombre', read_only=True)
    serie_nombre = serializers.CharField(source='serie.nombre', read_only=True)
    linea = serializers.IntegerField(source='serie.linea_id', read_only=True)
    marca = serializers.IntegerField(source='modelo.marca_id', read_only=True)
    marca_nombre = serializers.CharField(source='modelo.marca.nombre', read_only=True)
    modelo_nombre = serializers.CharField(source='modelo.nombre', read_only=True)
    color_nombre = serializers.CharField(source='color.nombre', read_only=True)
    tipo_nombre = serializers.CharField(source='tipo.nombre', read_only=True)

    class Meta:
        model = HotWheel
        fields = '__all__'
        read_only_fields = ('creado_en', 'actualizado_en')

    def validate(self, attrs):
        # el stock de un auto existente solo cambia vía /movimientos/
        if self.instance and 'cantidad' in attrs:
            raise serializers.ValidationError(
                {'cantidad': 'Para cambiar el stock usa el endpoint de movimientos.'}
            )
        return attrs


class MovimientoSerializer(serializers.Serializer):
    tipo = serializers.ChoiceField(choices=MovimientoStock.Tipo.choices)
    cantidad = serializers.IntegerField(min_value=0)
    nota = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['tipo'] != MovimientoStock.Tipo.AJUSTE and attrs['cantidad'] < 1:
            raise serializers.ValidationError({'cantidad': 'Debe ser al menos 1.'})
        return attrs