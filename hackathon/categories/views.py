from django.shortcuts import render
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import HelperForm
from .models import AdditionalInfo, Category
from django.contrib.auth import authenticate, login

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.urls import reverse

>>>>>>> 14ad123269f3b37081c67d9bf81f57b4ffc0e7be

from django.shortcuts import render, redirect
from .models import Helper, Category

def categories(request):
    all_categories = Category.objects.all()
    selected_cats = request.GET.getlist('categories')

    helpers = AdditionalInfo.objects.filter(is_online=True)

    if selected_cats:
        helpers = helpers.filter(categories__id__in=selected_cats).distinct()

    helpers = helpers.order_by('-rate')
    user_data = [None]
    if request.user.is_authenticated:
        user_data = AdditionalInfo.objects.get_or_create(user_id = request.user.id)
    return render(request, 'categories/categories.html', {
        'helpers': User.objects.all(),
        'all_categories': all_categories,
        'selected_cats': list(map(int, selected_cats)) if selected_cats else [],
        'user_data' : user_data[0]
    })


def auth(request):
    return render(request, 'categories/auth.html')


def register_view(request):
    if request.method == 'POST':
        username = request.POST.get("login")  # <- Изменили 'login' на 'username'
        email = request.POST.get("email")
        password = request.POST.get("password")

        if not all([username, email, password]):
            messages.error(request, "Все поля обязательны для заполнения")
            return redirect('auth')

        try:
            validate_email(email)
        except ValidationError:
            messages.error(request, "Некорректный email")
            return redirect('auth')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Пользователь с таким логином уже существует")
            return redirect('auth')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Пользователь с таким email уже существует")
            return redirect('auth')

        try:
            user = User.objects.create_user(
                username=username,  # <- Используем новое имя переменной
                email=email,
                password=password
            )
            auth_user = authenticate(request, username=username, password=password)
            if auth_user is not None:
                login(request, auth_user)  # <- Теперь 'login' это функция
                messages.success(request, "Регистрация прошла успешно!")
                return redirect('categories')
            else:
                messages.error(request, "Ошибка аутентификации")
                return redirect('auth')

        except Exception as e:
            messages.error(request, f"Ошибка: {str(e)}")
            return redirect('auth')

    return render(request, 'categories/login.html')


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

def redirect_to_chat(request, helper_id):
    return redirect(reverse('chat:chat-view', kwargs={'user_id': helper_id}))
def profile(request):
    user_id = request.user.id
    user_data = AdditionalInfo.objects.get_or_create(user_id = user_id)
    return render(request, 'categories/profile.html', {'user_data': user_data[0]})
def change_profile(request):
    if request.method != 'POST' or not request.user.is_authenticated:
        return redirect('profile')

    # Читаем форму
    description = request.POST.get('description', '').strip()
    university  = request.POST.get('university', '').strip()
    course      = request.POST.get('course', '').strip()
    phone       = request.POST.get('phone',  '').strip()
    photo_file  = request.FILES.get('photo')

    # Берём или создаём запись
    user_data, _ = AdditionalInfo.objects.get_or_create(user_id=request.user.id)

    # Обновляем обычные поля
    user_data.description = description
    user_data.university  = university
    if course:
        user_data.course = course
    if phone:
        user_data.phone = phone
    # Если пришёл новый файл — удаляем старый (если он был) и сохраняем новый
    if photo_file:
        # удалит файл из MEDIA_ROOT, но не затронет статический дефолт
        if user_data.photo:
            user_data.photo.delete(save=False)
        user_data.photo = photo_file

    # Финальное сохранение
    user_data.save()
    messages.success(request, "Профиль успешно обновлён")
    return redirect('categories')


def start_steam(request):
    return redirect('categories')

def stop_stream(request):
    return redirect('categories')