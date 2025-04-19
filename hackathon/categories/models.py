from django.db import models


class Helper(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name="Name")
    description = models.TextField(max_length=65535, blank=True, null=True, verbose_name="Description")
    rate = models.IntegerField(blank=True, null=True, verbose_name="Rating")
    university = models.CharField(max_length=65535, blank=True, null=True, verbose_name="University")
    course = models.IntegerField(blank=True, null=True, verbose_name="Course")
    rank = models.IntegerField(blank=True, null=True, verbose_name="Rank")

    # Many-to-many relationship with categories from another DB
    categories = models.ManyToManyField(
        'categories.Category',
        blank=True,
        verbose_name="Categories"
    )

    class Meta:
        verbose_name = "Helper"
        verbose_name_plural = "Helpers"

    def __str__(self):
        return self.name


# This would be in your categories app/models.py
class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        # using = 'categories_db'  # Uncomment if using a different database

    def __str__(self):
        return self.name