from rest_framework import serializers
from .models import Category, CustomUser
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'updated_at','image']
        read_only_fields = ['id', 'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
    email = serializers.EmailField(required=True) 

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'phone', 'image')  # email тут

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Паролі не співпадають."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Користувача з такою поштою не знайдено.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6, validators=[validate_password])

class UserProfileSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'phone', 'image')
        read_only_fields = ('id', 'email', 'username')

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if hasattr(obj.image, 'url'):
                url = obj.image.url
                if request is not None:
                    return request.build_absolute_uri(url)
                return url
            else:
                return obj.image  # якщо це зовнішній URL
        return None