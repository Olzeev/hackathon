from django.db import models
from django.contrib.auth.models import User


class ChatMessage(models.Model):
    """Одно сообщение в чате стрима."""
    room = models.CharField(max_length=64, db_index=True,default='', )      # id стрима (тот‑же, что в URL)
    author = models.ForeignKey(User, null=True, blank=True,    # может быть аноним
                               on_delete=models.SET_NULL)
    content = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created']          # удобнее сразу по времени