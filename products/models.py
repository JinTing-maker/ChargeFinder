from django.db import models


class Protocol(models.Model):
    name = models.CharField(max_length=30, unique=True, verbose_name='协议名称')

    class Meta:
        ordering = ['name']
        verbose_name = '快充协议'
        verbose_name_plural = '快充协议'

    def __str__(self):
        return self.name


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('充电器', '充电器'),
        ('充电宝', '充电宝'),
    ]

    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, verbose_name='类别')
    brand = models.CharField(max_length=50, verbose_name='品牌')
    name = models.CharField(max_length=100, verbose_name='型号名称')
    max_power = models.IntegerField(verbose_name='最高总功率(W)')
    max_single_power = models.IntegerField(verbose_name='单口最高功率(W)')
    protocols = models.ManyToManyField(Protocol, blank=True, verbose_name='支持协议')
    ports_desc = models.CharField(max_length=20, verbose_name='接口描述')
    port_count = models.IntegerField(default=1, verbose_name='接口数量')
    has_usb_a = models.BooleanField(default=False, verbose_name='是否带USB-A口')
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name='参考价格')
    good_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='好价')
    image = models.ImageField(upload_to='products/', verbose_name='产品图片')
    weight = models.IntegerField(null=True, blank=True, verbose_name='重量(g)')
    volume = models.IntegerField(null=True, blank=True, verbose_name='体积(cm³)')
    variants = models.JSONField(null=True, blank=True, verbose_name='颜色变体')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        ordering = ['-created_at']
        verbose_name = '产品'
        verbose_name_plural = '产品'

    def __str__(self):
        return f'{self.brand} {self.name}'


class PowerRange(models.Model):
    label = models.CharField(max_length=20, verbose_name='挡位名称')
    min_value = models.IntegerField(default=0, verbose_name='最小功率(W)')
    max_value = models.IntegerField(verbose_name='最大功率(W)', help_text='0 表示无上限')

    class Meta:
        ordering = ['min_value']
        verbose_name = '功率挡位'
        verbose_name_plural = '功率挡位'

    def __str__(self):
        return self.label
