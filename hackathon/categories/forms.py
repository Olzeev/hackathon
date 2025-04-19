from django import forms
from .models import Helper, Category




class HelperForm(forms.ModelForm):
    categories = forms.ModelMultipleChoiceField(
        queryset=Category.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Helper
        fields = ['name', 'description', 'rate', 'university', 'course', 'rank', 'photo', 'categories']
