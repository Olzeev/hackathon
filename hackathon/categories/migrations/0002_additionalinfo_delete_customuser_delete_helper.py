# Generated by Django 5.2 on 2025-04-19 21:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdditionalInfo',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('description', models.TextField(blank=True, max_length=65535, null=True, verbose_name='Description')),
                ('rate', models.IntegerField(blank=True, null=True, verbose_name='Rating')),
                ('university', models.CharField(blank=True, max_length=65535, null=True, verbose_name='University')),
                ('course', models.IntegerField(blank=True, null=True, verbose_name='Course')),
                ('rank', models.IntegerField(blank=True, null=True, verbose_name='Rank')),
                ('photo', models.ImageField(blank=True, null=True, upload_to='media', verbose_name='Profile Photo')),
                ('is_online', models.BooleanField(default=False, verbose_name='Online Status')),
                ('categories', models.ManyToManyField(blank=True, to='categories.category', verbose_name='Categories')),
            ],
            options={
                'verbose_name': 'Additional info',
                'verbose_name_plural': 'Additional info',
            },
        ),
        migrations.DeleteModel(
            name='CustomUser',
        ),
        migrations.DeleteModel(
            name='Helper',
        ),
    ]
