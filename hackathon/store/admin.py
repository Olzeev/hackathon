from django.contrib import admin
from .models import Package

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "points", "price", "discount"]
    list_editable = ["points", "price", "discount"]
    prepopulated_fields = {'slug': ('name',)}