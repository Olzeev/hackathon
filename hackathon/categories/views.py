from django.shortcuts import render
<<<<<<< HEAD

from .models import Helper
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib import messages
=======
from .forms import HelperForm
from categories.models import Helper

>>>>>>> 4282456b74cbe8d243875a319a8b4d976ee046a8

from django.shortcuts import render, redirect
from .models import Helper, Category

def categories(request):
    all_categories = Category.objects.all()
    selected_cats = request.GET.getlist('categories')

    helpers = Helper.objects.filter(is_online=True)

    if selected_cats:
        helpers = helpers.filter(categories__id__in=selected_cats).distinct()

    helpers = helpers.order_by('-rate')

    return render(request, 'categories/categories.html', {
        'helpers': helpers,
        'all_categories': all_categories,
        'selected_cats': list(map(int, selected_cats)) if selected_cats else [],
    })

def auth(request):
    return render(request, 'categories/auth.html')

<<<<<<< HEAD

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
=======
>>>>>>> 4282456b74cbe8d243875a319a8b4d976ee046a8
def login(request):
    return render(request, 'categories/login.html')

def logged(request):
    return render(request, 'categories/categories_logged.html')

def become_helper(request):
    if request.method == 'POST':
        form = HelperForm(request.POST, request.FILES)
        if form.is_valid():
            helper = form.save(commit=False)
            helper.is_online = False  # по умолчанию офлайн
            helper.save()
            form.save_m2m()  # сохранить категории
            return redirect('categories')
    else:
        form = HelperForm()
    return render(request, 'categories/become_helper.html', {'form': form})
