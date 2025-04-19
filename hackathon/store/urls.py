from django.urls import path
from .views import store_view, buy_package

urlpatterns = [
    path('', store_view, name = 'store'),
    path('buy/<int:package_id>/', buy_package, name='buy_package'),
]