from django.shortcuts import render
from .models import Helper

# View to display all helpers as cards
# Assumes template at 'categories.html'
def categories(request):
    # Получаем всех помощников из базы данных
    helpers = Helper.objects.all()  # импорт модели Helper :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
    # Передаем их в шаблон для рендеринга
    return render(request, 'categories/categories.html', {
        'helpers': helpers,
    })