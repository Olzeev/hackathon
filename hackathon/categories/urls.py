from django.urls import path, include
from . import views
from django.conf import settings
from chat.views import index
from django.conf.urls.static import static
urlpatterns = [
    path('', views.categories, name='categories'),
    path('auth/', views.auth, name = 'auth'),
    path('register_view', views.register_view, name = "register_view"),
    path('chat/<int:helper_id>/', views.redirect_to_chat, name='redirect_to_chat'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('profile/', views.profile, name = 'profile'),
    path('change_profile/', views.change_profile, name = 'change_profile'),
    path('become_helper', views.become_helper, name='become_helper')
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)