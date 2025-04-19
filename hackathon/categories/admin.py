from django.contrib import admin

from categories.models import AdditionalInfo, Category

# Register your models here.
admin.site.register(AdditionalInfo)
admin.site.register(Category)