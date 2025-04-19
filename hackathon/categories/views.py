from django.shortcuts import render

def categories(request):
    return render(request, 'categories/categories.html')