from django.db import models
from django.urls import reverse


class Package(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название пакета")
    slug = models.SlugField(max_length=100)
    description = models.TextField(verbose_name="Описание")
    points = models.PositiveIntegerField(verbose_name="Количество баллов")
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Цена (₽)")
    discount = models.DecimalField(default=0.00, max_digits=4, decimal_places=2)

    class Meta:
        ordering = ['points']

    def __str__(self):
        return f"{self.name} — {self.points} баллов за {self.price} ₽"

    def get_absolute_url(self):
        return reverse('store:package_detail', args = [self.slug])

    def sell_price(self):
        if self.discount:
            return round(self.price - self.price * self.discount / 100, 2)
        return self.price