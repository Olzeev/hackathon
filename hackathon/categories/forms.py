from django import forms
from .models import AdditionalInfo, Category




class HelperForm(forms.ModelForm):
    categories = forms.ModelMultipleChoiceField(
        queryset=Category.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = AdditionalInfo
        fields = ['description', 'rate', 'university', 'course', 'rank', 'photo', 'categories']
