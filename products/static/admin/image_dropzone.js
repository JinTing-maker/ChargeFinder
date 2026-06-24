document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.querySelector('#id_image');
    if (!imageInput) return;

    const clearCheckbox = document.querySelector('#image-clear_id');

    // 定位标签（保留显示）和 widget 区域
    const label = document.querySelector('label[for="id_image"]');

    // 隐藏文件输入框本身（用 CSS 隐藏，保留功能）
    imageInput.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';

    // 隐藏默认 widget 的可见部分：图片链接、清除行等
    if (clearCheckbox && clearCheckbox.parentElement) {
        clearCheckbox.parentElement.style.display = 'none';
    }
    // 隐藏 "当前: xxx.png" 链接
    const mediaLink = document.querySelector('a[href*="/media/"]');
    if (mediaLink) {
        const linkWrapper = mediaLink.closest('div');
        if (linkWrapper) linkWrapper.style.display = 'none';
        else mediaLink.style.display = 'none';
    }

    // 查找是否有已保存图片的缩略图（Django admin 中 <img> 跟在链接后）
    const existingImg = document.querySelector('.field-image img:not(.dropzone-preview), .form-row.field-image img:not(.dropzone-preview)');
    let existingSrc = '';
    if (existingImg && existingImg.src && existingImg.src.includes('/media/')) {
        existingSrc = existingImg.src;
        existingImg.style.display = 'none';
    }

    // ---------- 构建自定义 UI ----------

    // 外层容器，放在 label 后面，替换默认 widget 区域
    const container = document.createElement('div');
    container.style.cssText = 'margin-top:6px;';

    // 预览图
    const previewImg = document.createElement('img');
    previewImg.className = 'dropzone-preview';
    previewImg.style.cssText =
        'max-width:300px;max-height:200px;border-radius:10px;display:none;margin-bottom:10px;object-fit:contain;border:1px solid #e5e7eb;';
    if (existingSrc) {
        previewImg.src = existingSrc;
        previewImg.style.display = 'block';
    }

    // dropzone 区域（紧凑）
    const dropzone = document.createElement('div');
    dropzone.style.cssText = [
        'border:2px dashed #d1d5db',
        'border-radius:10px',
        'padding:20px 16px',
        'text-align:center',
        'cursor:pointer',
        'transition:all .2s',
        'background:#fafafa',
        'user-select:none',
        'max-width:300px',
    ].join(';');

    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('width', '32');
    iconSvg.setAttribute('height', '32');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.setAttribute('stroke', '#9ca3af');
    iconSvg.setAttribute('stroke-width', '1.5');
    iconSvg.setAttribute('stroke-linecap', 'round');
    iconSvg.setAttribute('stroke-linejoin', 'round');
    iconSvg.style.margin = '0 auto 6px';
    iconSvg.style.display = 'block';
    iconSvg.innerHTML =
        '<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>';

    const hintText = document.createElement('p');
    hintText.style.cssText = 'color:#9ca3af;font-size:12px;margin:0;';

    const subText = document.createElement('p');
    subText.style.cssText = 'color:#d1d5db;font-size:10px;margin:2px 0 0;';

    function setHintForNew() {
        iconSvg.style.display = 'block';
        hintText.textContent = '拖拽图片到此处或点击选择';
        subText.textContent = 'PNG ／ JPG ／ WebP';
    }
    function setHintForExisting(name, size) {
        iconSvg.style.display = 'none';
        if (size !== undefined) {
            hintText.textContent = name + '（' + size + '）';
        } else {
            hintText.textContent = name;
        }
        subText.textContent = '拖入新图片替换，或点击更换';
    }

    if (existingSrc) {
        setHintForExisting('当前图片');
    } else {
        setHintForNew();
    }

    dropzone.appendChild(iconSvg);
    dropzone.appendChild(hintText);
    dropzone.appendChild(subText);

    container.appendChild(previewImg);
    container.appendChild(dropzone);

    // 插入：如果 label 存在，放在 label 的父元素中、紧接 label 之后
    // 否则放在 imageInput 之前
    if (label && label.parentElement) {
        label.parentElement.insertBefore(container, label.nextSibling);
    } else {
        imageInput.parentElement.insertBefore(container, imageInput);
    }

    // ---------- 交互 ----------

    dropzone.addEventListener('click', () => imageInput.click());

    function dragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '#f97316';
        dropzone.style.background = '#fff7ed';
    }
    function dragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '#d1d5db';
        dropzone.style.background = '#fafafa';
    }
    dropzone.addEventListener('dragenter', dragOver);
    dropzone.addEventListener('dragover', dragOver);
    dropzone.addEventListener('dragleave', dragLeave);
    dropzone.addEventListener('drop', function (e) {
        dragLeave(e);
        const files = e.dataTransfer.files;
        if (files.length) {
            const dt = new DataTransfer();
            dt.items.add(files[0]);
            imageInput.files = dt.files;
            showPreview(files[0]);
        }
    });

    imageInput.addEventListener('change', function () {
        if (imageInput.files && imageInput.files[0]) {
            showPreview(imageInput.files[0]);
            if (clearCheckbox) clearCheckbox.checked = false;
        }
    });

    if (clearCheckbox) {
        clearCheckbox.addEventListener('change', function () {
            if (clearCheckbox.checked) {
                imageInput.value = '';
                previewImg.src = '';
                previewImg.style.display = 'none';
                setHintForNew();
            }
        });
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            setHintForExisting(file.name, (file.size / 1024).toFixed(1) + ' KB');
        };
        reader.readAsDataURL(file);
    }
});
