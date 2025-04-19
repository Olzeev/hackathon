from django.shortcuts import render

from categories.models import Helper


# View to display only online helpers, sorted by descending rating
def categories(request):
    # Фильтруем помощников по статусу онлайн и сортируем по рейтингу (по убыванию)
    helpers = Helper.objects.filter(is_online=True).order_by('-rate')
    return render(request, 'categories/categories.html', {'helpers': helpers})
def auth(request):
    return render(request, 'categories/auth.html')
def login(request):
    return render(request, 'categories/login.html')
def logged(request):
    return render(request, 'categories/categories_logged.html')