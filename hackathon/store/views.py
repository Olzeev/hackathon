from django.shortcuts import render
from .models import Package  # если у тебя есть модель для пакетов
from django.shortcuts import redirect, get_object_or_404

def store_view(request):
    packages = Package.objects.all()  # если у тебя есть модель, иначе можно просто заглушку
    return render(request, 'store/store.html', {'packages': packages})
def package_detail(request, slug):
    package = get_object_or_404(Package, slug = slug)
    return render(request, 'store/detail.html', {'package': package})