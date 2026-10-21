from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken

from .filters import HotWheelFilter
from .models import (
    Linea, Serie, Marca, Modelo, Color, Tipo, HotWheel, MovimientoStock
)
from .serializers import (
    LineaSerializer, SerieSerializer, MarcaSerializer, ModeloSerializer,
    ColorSerializer, TipoSerializer, HotWheelSerializer, MovimientoSerializer,
)


class LoginView(ObtainAuthToken):
    authentication_classes = []        # ignora tokens viejos al iniciar sesión
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        if not user.is_staff:
            return Response({'detail': 'No tienes permisos de administrador.'}, status=403)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})
    
class PublicReadAdminWriteMixin:
    """Lectura pública, escritura solo admin."""
    def get_permissions(self):
        if self.action in ('list', 'retrieve','anios'):
            return [AllowAny()]
        return [IsAdminUser()]


class CatalogoViewSet(PublicReadAdminWriteMixin, viewsets.ModelViewSet):
    pagination_class = None   # los dropdowns necesitan la lista completa


class LineaViewSet(CatalogoViewSet):
    queryset = Linea.objects.all()
    serializer_class = LineaSerializer


class SerieViewSet(CatalogoViewSet):
    queryset = Serie.objects.select_related('linea')
    serializer_class = SerieSerializer
    filterset_fields = ['linea']


class MarcaViewSet(CatalogoViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer


class ModeloViewSet(CatalogoViewSet):
    queryset = Modelo.objects.select_related('marca')
    serializer_class = ModeloSerializer
    filterset_fields = ['marca']


class ColorViewSet(CatalogoViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer


class TipoViewSet(CatalogoViewSet):
    queryset = Tipo.objects.all()
    serializer_class = TipoSerializer


class HotWheelViewSet(PublicReadAdminWriteMixin, viewsets.ModelViewSet):
    serializer_class = HotWheelSerializer
    filterset_class = HotWheelFilter
    search_fields = [
        'modelo__nombre', 'modelo__marca__nombre', 'serie__nombre',
        'numero', 'codigo_barras', 'codigo_producto',
    ]
    ordering_fields = ['precio_venta', 'anio', 'creado_en']

    def get_queryset(self):
        qs = HotWheel.objects.select_related(
            'serie__linea', 'modelo__marca', 'color', 'tipo'
        )
        user = self.request.user
        if not (user.is_authenticated and user.is_staff):
            qs = qs.exclude(estado=HotWheel.Estado.INACTIVO)
        return qs

    def perform_create(self, serializer):
        with transaction.atomic():
            hw = serializer.save()
            if hw.cantidad > 0:
                MovimientoStock.objects.create(
                    hot_wheel=hw, usuario=self.request.user,
                    tipo=MovimientoStock.Tipo.INGRESO,
                    cantidad=hw.cantidad, nota='Stock inicial',
                )

    def perform_destroy(self, instance):
        # eliminación lógica
        instance.estado = HotWheel.Estado.INACTIVO
        instance.save()

    @action(detail=True, methods=['post'], serializer_class=MovimientoSerializer)
    def movimientos(self, request, pk=None):
        ser = MovimientoSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tipo = ser.validated_data['tipo']
        cantidad = ser.validated_data['cantidad']

        with transaction.atomic():
            hw = get_object_or_404(HotWheel.objects.select_for_update(), pk=pk)

            if tipo == MovimientoStock.Tipo.INGRESO:
                hw.cantidad += cantidad
            elif tipo == MovimientoStock.Tipo.AJUSTE:
                hw.cantidad = cantidad
            else:  # venta o baja
                if cantidad > hw.cantidad:
                    return Response({'detail': 'Stock insuficiente.'}, status=400)
                hw.cantidad -= cantidad

            hw.save()
            MovimientoStock.objects.create(
                hot_wheel=hw, usuario=request.user, tipo=tipo,
                cantidad=cantidad, nota=ser.validated_data.get('nota', ''),
            )

        return Response(HotWheelSerializer(hw, context={'request': request}).data)

    @action(detail=False, methods=['get'], url_path=r'por-codigo/(?P<codigo>[^/.]+)')
    def por_codigo(self, request, codigo=None):
        qs = self.get_queryset().filter(codigo_barras=codigo)
        data = HotWheelSerializer(qs, many=True, context={'request': request}).data
        return Response({'encontrado': qs.exists(), 'resultados': data})
    
    @action(detail=False, methods=['get'])
    def anios(self, request):
        qs = self.get_queryset().order_by('-anio').values_list('anio', flat=True).distinct()
        return Response(list(qs))