from django.contrib import admin
from django.utils.html import format_html
from .models import Product, PowerRange, Protocol


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'thumbnail_preview',
        'brand',
        'name',
        'category',
        'max_power_display',
        'price',
    ]
    list_display_links = ['brand', 'name']
    list_filter = ['category', 'brand']
    search_fields = ['brand', 'name', 'protocols__name']
    autocomplete_fields = ['protocols']
    list_per_page = 30

    class Media:
        js = ['admin/protocol_widget.js', 'admin/image_dropzone.js']

    fieldsets = (
        ('基本信息', {
            'fields': ('category', 'brand', 'name', 'image')
        }),
        ('功率与接口', {
            'fields': ('max_power', 'max_single_power', 'protocols', 'ports_desc', 'port_count', 'has_usb_a')
        }),
        ('价格', {
            'fields': ('price', 'good_price')
        }),
        ('其他属性', {
            'fields': ('weight', 'volume', 'variants')
        }),
    )

    @admin.display(description='缩略图')
    def thumbnail_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height: 60px; border-radius: 4px;" />',
                obj.image.url
            )
        return '-'

    @admin.display(description='功率')
    def max_power_display(self, obj):
        return f'{obj.max_power}W'


@admin.register(PowerRange)
class PowerRangeAdmin(admin.ModelAdmin):
    list_display = ['label', 'min_value', 'max_value']


@admin.register(Protocol)
class ProtocolAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
