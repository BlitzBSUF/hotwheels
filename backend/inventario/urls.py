from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('lineas', views.LineaViewSet)
router.register('series', views.SerieViewSet)
router.register('marcas', views.MarcaViewSet)
router.register('modelos', views.ModeloViewSet)
router.register('colores', views.ColorViewSet)
router.register('tipos', views.TipoViewSet)
router.register('hot-wheels', views.HotWheelViewSet, basename='hot-wheels')

urlpatterns = router.urls