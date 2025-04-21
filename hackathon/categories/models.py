from email.policy import default
from django.contrib.auth.models import User
from django.db import models
from django.templatetags.static import static


class AdditionalInfo(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField(default = 0)
    description = models.TextField(max_length=65535, blank=True, null=True, verbose_name="Description", default="Ваше описание")
    rate = models.FloatField(blank=True, null=True, verbose_name="Rating", default = 5.0)
    university = models.CharField(max_length=65535, blank=True, null=True, verbose_name="Название университета", default = "")
    course = models.IntegerField(blank=True, null=True, verbose_name="Course", default=1)
    rank = models.IntegerField(blank=True, null=True, verbose_name="Rank", default=1)
    is_mentor = models.BooleanField(default = False)
    phone = models.CharField(max_length = 20, default = "+7 (XXX) XXX-XX-XX")

    balance = models.PositiveIntegerField(
        default = 0,
        verbose_name='Balance'
    )
    # Profile photo
    photo = models.ImageField(
        upload_to='media',
        blank=True,
        null=True,
        verbose_name='Profile Photo', 
    )

    def photo_url(self):
        # есть имя и файл?
        if self.photo and self.photo.name:
            return self.photo.url
        # иначе — статика
        return static('categories/img/default-avatar.png')
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
        verbose_name = "Additional info"
        verbose_name_plural = "Additional info"

    @property
    def username(self):
        user = User.objects.filter(pk=self.user_id).first()
        return user.username if user else '—'
    
    def __str__(self):
        return self.username
    



class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

