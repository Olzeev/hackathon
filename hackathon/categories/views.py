from django.shortcuts import render

from .models import Helper
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib import messages

# View to display only online helpers, sorted by descending rating
def categories(request):
    # Фильтруем помощников по статусу онлайн и сортируем по рейтингу (по убыванию)
    helpers = Helper.objects.filter(is_online=True).order_by('-rate')
    return render(request, 'categories/categories.html', {'helpers': helpers})
def auth(request):
    return render(request, 'categories/auth.html')


def register_view(request):
    if request.method == 'POST':
        login = request.POST.get("login")
        email = request.POST.get("email")
        password = request.POST.get("password")

        # Валидация данных
        if not all([login, email, password]):
            messages.error(request, "Все поля обязательны для заполнения")
            return redirect('auth')

        if User.objects.filter(username=login).exists():
            messages.error(request, "Пользователь с таким логином уже существует")
            return redirect('auth')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Пользователь с таким email уже существует")
            return redirect('auth')

        try:
            # Правильное создание пользователя
            user = User.objects.create_user(
                username=login,
                email=email,
                password=password
            )
            # Дополнительные поля, если нужно
            # user.first_name = request.POST.get("first_name", "")
            # user.save()

            messages.success(request, "Регистрация прошла успешно!")
            return redirect('logged')

        except Exception as e:
            messages.error(request, f"Ошибка при регистрации: {str(e)}")
            return redirect('auth')

    return render(request, 'categories/login.html')
def login(request):
    return render(request, 'categories/login.html')
def logged(request):
    return render(request, 'categories/categories_logged.html')