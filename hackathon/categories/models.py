from django.db import models


class AdditionalInfo(models.Model):
    id = models.AutoField(primary_key=True)
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
        verbose_name = "Additional info"
        verbose_name_plural = "Additional info"

    def str(self):
        return self.id


class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def str(self):
        return self.name

