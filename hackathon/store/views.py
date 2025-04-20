from django.shortcuts import render
from .models import Package
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from categories.models import AdditionalInfo

def store_view(request):
    packages = Package.objects.all()
    balance = None
    if request.user.is_authenticated:
        info, _ = AdditionalInfo.objects.get_or_create(user_id=request.user.id)
        balance = info.balance

    return render(request, 'store/store.html', {
        'packages': packages,
        'balance': balance,
    })
def package_detail(request, slug):
    package = get_object_or_404(Package, slug=slug)
    balance = None
    if request.user.is_authenticated:
            info, _ = AdditionalInfo.objects.get_or_create(user_id=request.user.id)
            balance = info.balance
    return render(request, 'store/detail.html', {
        'package': package,
        'balance': balance,
    })

@login_required
def buy_package(request, slug):
    package = get_object_or_404(Package, slug=slug)
    info, _ = AdditionalInfo.objects.get_or_create(user_id=request.user.id)

    if request.method == 'POST':
        info.balance += package.points
        info.save()
        messages.success(
            request,
            f'Вы успешно приобрели «{package.name}» и получили {package.points} баллов!'
        )
        # после покупки возвращаемся на ту же страницу деталей
        return redirect('/store/')

    # теоретически сюда мы не попадаем, т.к. из шаблона идёт только POST
    return redirect('store:package_detail', slug=slug)