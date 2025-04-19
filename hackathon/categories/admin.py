from django.contrib import admin

from categories.models import Helper, Category, CustomUser

# Register your models here.
admin.site.register(Helper)
admin.site.register(Category)
admin.site.register(CustomUser)