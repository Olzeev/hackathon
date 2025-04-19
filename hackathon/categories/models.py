from django.db import models


class Helper(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name="Name")
    description = models.TextField(max_length=65535, blank=True, null=True, verbose_name="Description")
    rate = models.IntegerField(blank=True, null=True, verbose_name="Rating")
    university = models.CharField(max_length=65535, blank=True, null=True, verbose_name="University")
    course = models.IntegerField(blank=True, null=True, verbose_name="Course")
    rank = models.IntegerField(blank=True, null=True, verbose_name="Rank")

    # Profile photo
    photo = models.ImageField(
        upload_to='media',
        blank=True,
        null=True,
        verbose_name='Profile Photo'
    )
    # Online status
    is_online = models.BooleanField(
        default=False,
        verbose_name='Online Status'
    )

    # Many-to-many relationship with categories from another DB
    categories = models.ManyToManyField(
        'categories.Category',
        blank=True,
        verbose_name="Categories"
    )

    class Meta:
        verbose_name = "Helper"
        verbose_name_plural = "Helpers"

    def str(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def str(self):
        return self.name



class CustomUser(models.Model):
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    email = models.CharField(max_length=50, unique=True, verbose_name='Email')
    password = models.CharField(max_length=20, unique=True, verbose_name='Password')
    login = models.CharField(max_length=20, unique=True, verbose_name='login')
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username