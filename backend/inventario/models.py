from django.conf import settings
from django.db import models


class Linea(models.Model):
    nombre = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Serie(models.Model):
    linea = models.ForeignKey(Linea, on_delete=models.PROTECT, related_name='series')
    nombre = models.CharField(max_length=100)

    class Meta:
        ordering = ['nombre']
        unique_together = ('linea', 'nombre')

    def __str__(self):
        return f'{self.nombre} ({self.linea})'


class Marca(models.Model):
    nombre = models.CharField(max_length=60, unique=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Modelo(models.Model):
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name='modelos')
    nombre = models.CharField(max_length=100)

    class Meta:
        ordering = ['nombre']
        unique_together = ('marca', 'nombre')

    def __str__(self):
        return f'{self.marca} {self.nombre}'


class Color(models.Model):
    nombre = models.CharField(max_length=40, unique=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Tipo(models.Model):
    nombre = models.CharField(max_length=40, unique=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class HotWheel(models.Model):
    class Estado(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        AGOTADO = 'agotado', 'Agotado'
        INACTIVO = 'inactivo', 'Inactivo'

    anio = models.PositiveSmallIntegerField()
    serie = models.ForeignKey(Serie, on_delete=models.PROTECT, related_name='hot_wheels')
    numero = models.CharField(max_length=10)
    modelo = models.ForeignKey(Modelo, on_delete=models.PROTECT, related_name='hot_wheels')
    color = models.ForeignKey(Color, on_delete=models.PROTECT, related_name='hot_wheels')
    tipo = models.ForeignKey(Tipo, on_delete=models.PROTECT, related_name='hot_wheels')
    codigo_barras = models.CharField(max_length=30, blank=True, db_index=True)
    codigo_producto = models.CharField(max_length=20, blank=True)
    imagen = models.ImageField(upload_to='hotwheels/', blank=True, null=True)
    descripcion = models.TextField(blank=True)
    cantidad = models.PositiveIntegerField(default=0)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.DISPONIBLE)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-anio', 'serie', 'numero']
        unique_together = ('anio', 'serie', 'numero', 'color', 'tipo')

    def save(self, *args, **kwargs):
        # estado automático según stock (salvo que esté inactivo)
        if self.estado != self.Estado.INACTIVO:
            self.estado = (
                self.Estado.DISPONIBLE if self.cantidad > 0 else self.Estado.AGOTADO
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.anio} #{self.numero} {self.modelo}'


class MovimientoStock(models.Model):
    class Tipo(models.TextChoices):
        INGRESO = 'ingreso', 'Ingreso'
        VENTA = 'venta', 'Venta'
        AJUSTE = 'ajuste', 'Ajuste'
        BAJA = 'baja', 'Baja'

    hot_wheel = models.ForeignKey(HotWheel, on_delete=models.PROTECT, related_name='movimientos')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    cantidad = models.PositiveIntegerField()
    nota = models.CharField(max_length=200, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.tipo} x{self.cantidad} - {self.hot_wheel}'