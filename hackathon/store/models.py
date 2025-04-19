from django.db import models

class Package(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название пакета")
    description = models.TextField(verbose_name="Описание")
    points = models.PositiveIntegerField(verbose_name="Количество баллов")
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Цена (₽)")

    def __str__(self):
        return f"{self.name} — {self.points} баллов за {self.price} ₽"
