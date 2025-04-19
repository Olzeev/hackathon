from django.shortcuts import render

from categories.models import Helper


from django.shortcuts import render
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
def login(request):
    return render(request, 'categories/login.html')
def logged(request):
    return render(request, 'categories/categories_logged.html')