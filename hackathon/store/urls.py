from django.urls import path
from .views import store_view,package_detail
app_name = 'store'
urlpatterns = [
    path('', store_view, name = 'store'),
    path('<slug:slug>/', package_detail, name = 'package_detail')
]