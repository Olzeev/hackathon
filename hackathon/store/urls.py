from django.urls import path
from .views import store_view,package_detail
from .views import buy_package

app_name = 'store'

urlpatterns = [
    path('', store_view, name = 'store'),
    path('<slug:slug>/', package_detail, name = 'package_detail'),
    path('buy/<slug:slug>/', buy_package, name='buy_package'),
]