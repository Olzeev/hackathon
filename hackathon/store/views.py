from django.shortcuts import render
from .models import Package  # если у тебя есть модель для пакетов
from django.shortcuts import redirect, get_object_or_404

def store_view(request):
    packages = Package.objects.all()  # если у тебя есть модель, иначе можно просто заглушку
    return render(request, 'store/store.html', {'packages': packages})
def buy_package(request, package_id):
    package = get_object_or_404(Package, id=package_id)

    # Здесь можно реализовать покупку, начисление баллов и т.д.
    # Пока просто редиректим назад
    print(f"Куплен пакет: {package.name} за {package.price} ₽")

    return redirect('store')  # Название главной страницы магазина
