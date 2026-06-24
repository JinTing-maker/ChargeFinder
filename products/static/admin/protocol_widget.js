document.addEventListener('DOMContentLoaded', function () {
    const wrappers = document.querySelectorAll('.related-widget-wrapper');
    wrappers.forEach(function (wrapper) {
        const addLink = wrapper.querySelector('.add-related');
        if (!addLink) return;

        // 隐藏 + 图标，替换为文字
        const img = addLink.querySelector('img');
        if (img) img.style.display = 'none';

        if (!addLink.querySelector('.add-text')) {
            const span = document.createElement('span');
            span.className = 'add-text';
            span.textContent = '自定义协议名';
            span.style.cssText = 'font-size:12px;color:#417690;margin-left:4px;cursor:pointer;';
            addLink.appendChild(span);
        }

        // 拦截点击，弹窗居中
        addLink.addEventListener('click', function (e) {
            e.preventDefault();
            const href = addLink.getAttribute('href');
            const w = 800, h = 500;
            const left = (screen.width - w) / 2;
            const top = (screen.height - h) / 2;
            window.open(href, 'protocol_add', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=yes');
        });
    });
});
