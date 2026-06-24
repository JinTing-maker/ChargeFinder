import json
from django.shortcuts import render, get_object_or_404
from django.core.serializers.json import DjangoJSONEncoder
from .models import Product, PowerRange, Protocol


def index(request):
    products = Product.objects.all()
    power_ranges = PowerRange.objects.all()

    # 从 Protocol 预设表读取所有协议
    all_protocols = list(Protocol.objects.values_list('name', flat=True))

    # 将产品序列化为 JSON（供 Alpine.js 使用）
    products_data = []
    for p in products:
        products_data.append({
            'id': p.id,
            'category': p.category,
            'brand': p.brand,
            'name': p.name,
            'max_power': p.max_power,
            'max_single_power': p.max_single_power,
            'protocols': [proto.name for proto in p.protocols.all()],
            'ports_desc': p.ports_desc,
            'port_count': p.port_count,
            'has_usb_a': p.has_usb_a,
            'price': str(p.price),
            'good_price': str(p.good_price) if p.good_price else '',
            'image_url': p.image.url if p.image else '',
            'weight': p.weight,
            'volume': p.volume,
            'variants': p.variants or [],
        })

    context = {
        'products_json': json.dumps(products_data, ensure_ascii=False, cls=DjangoJSONEncoder),
        'power_ranges': power_ranges,
        'all_protocols': all_protocols,
        'all_protocols_json': json.dumps(all_protocols, ensure_ascii=False),
    }
    return render(request, 'products/index.html', context)


def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    context = {
        'product': product,
        'protocols': [p.name for p in product.protocols.all()],
    }
    return render(request, 'products/detail.html', context)
