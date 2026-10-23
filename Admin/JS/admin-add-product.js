import createProductCard from '../../JS/productCard.js';
import { getProductById, addProduct, updateProduct } from '../../services/productService.js';
import uploadImage from '../../services/uploadService.js';
import initAdminPage from './adminPage.js';
import { createSizeRow } from './add-product-components.js';
import { setupOptionModal } from './optionModal.js';
import { initProductOptionsManager } from './productOptionsManager.js';
import { initImageManager } from './utils/imageManager.js';
let productId = null;
let existingImageUrl = null;
let isSubmitting = false; // הגנה מפני לחיצות כפולות
let currentObjectUrl = null;
// 1. נגישות מרכזית לטופס ולרכיבי ה-UI המבניים בלבד
const form = document.getElementById('product-form');
const ui = {
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    submitBtn: document.getElementById('submit-btn'),
    thumbImg: document.getElementById('thumb-img'),
    previewWrapper: document.getElementById('card-preview-wrapper'),
    quantityContainer: document.getElementById('quantity-container'),
    availabilityContainer: document.getElementById('availability-container')
};
// אתחול המנהלים המודולריים
const optionsManager = initProductOptionsManager();
// עדכון פונקציית התצוגה המקדימה כך שתקבל את ה-URL מהמנהל של התמונות
const updateLivePreview = (currentObjectUrl = null) => {
    const defaultImage = '../../assets/images/pinata-logo3.png';
    // שימוש ב-currentObjectUrl הקיים במקום יצירת קישור זמני חדש בכל הקלדה
    const finalImage = currentObjectUrl || existingImageUrl || defaultImage;
    // עדכון ה-src רק במידה והשתנה בפועל
    if (ui.thumbImg.getAttribute('src') !== finalImage) {
        ui.thumbImg.src = finalImage;
    }
    ui.thumbImg.onerror = () => { ui.thumbImg.src = defaultImage; };
    const tempProduct = {
        name: form.elements.name.value.trim() || 'שם המוצר',
        price: parseFloat(form.elements.price.value) || 0,
        description: form.elements.description.value.trim() || 'תיאור קצר של המוצר...',
        imageUrl: finalImage
    };
    ui.previewWrapper.replaceChildren(createProductCard(tempProduct));
};
const imageManager = initImageManager(form, updateLivePreview);
// 3. תצוגה מותנית של שדות המלאי
const toggleInventoryFields = () => {
    const isQuantityManaged = form.elements.hasQuantity.checked;
    //toggle מחליף בין המצבים, מוסיף/מסיר את המחלקה לפי הפרמטר שנשלח, 
    // אם נשלח FALSE הוא מסיר את המחלקה וכן להפך.
    ui.quantityContainer.classList.toggle('hidden', !isQuantityManaged);
    ui.availabilityContainer.classList.toggle('hidden', isQuantityManaged);
};
// 4. טעינת מוצר במצב עריכה
const loadExistingProduct = async (id) => {
    try {
        const product = await getProductById(id);
        if (!product) return;
        ui.pageTitle.textContent = `עריכת מוצר: ${product.name}`;
        ui.pageSubtitle.textContent = 'עדכן את פרטי המוצר והמלאי';
        ui.submitBtn.textContent = '💾 עדכון מוצר';
        // מילוי השדות ישירות דרך form.elements
        const el = form.elements;
        el.name.value = product.name || '';
        el.price.value = product.price || 0;
        el.description.value = product.description || '';
        existingImageUrl = product.imageUrl || '';
        el.isPopular.checked = Boolean(product.isPopular);
        if (product.quantity !== null && product.quantity !== undefined) {
            el.hasQuantity.checked = true;
            el.quantity.value = product.quantity;
        } else {
            el.hasQuantity.checked = false;
            el.isAvailable.checked = product.isAvailable ?? true;
        }
        toggleInventoryFields();
        // טעינת גדלים קיימים אם יש למוצר
        if (product.size && product.size.length > 0) {
            optionsManager.hasSizesCheckbox.checked = true;
            optionsManager.toggleSizesSection();
            optionsManager.sizesListContainer.textContent = '';
            product.size.forEach(s => {
                optionsManager.sizesListContainer.appendChild(createSizeRow(s.name, s.price, s.maxChoices));
            });
        }

        // טעינת קבוצות האפשרויות וסימון מה ששייך למוצר
        const selectedOptionIds = product.options ? product.options.map(opt => typeof opt === 'object' ? opt._id : opt) : [];
        await optionsManager.loadOptionGroups(selectedOptionIds);
        updateLivePreview();
    } catch (error) {
    }
};
const clearErrors = () => {
    const errorElements = form.querySelectorAll('[id^="error-"]');
    errorElements.forEach(el => { el.textContent = ''; });
};
const validateForm = () => {
    clearErrors();
    let isValid = true;
    const el = form.elements;
    if (!el.name.value.trim()) {
        document.getElementById('error-name').textContent = 'יש להזין שם מוצר';
        isValid = false;
    }
    if (!el.price.value || parseFloat(el.price.value) < 0) {
        document.getElementById('error-price').textContent = 'מחיר תקין הוא חובה';
        isValid = false;
    }
    if (!productId && (!el.imageUrl.files || el.imageUrl.files.length === 0)) {
        document.getElementById('error-imageUrl').textContent = 'יש לבחור תמונה למוצר';
        isValid = false;
    }
    return isValid;
};
// 6. טיפול בהגשת הטופס
const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; //  מניעת שליחה מחדש אם הבקשה כבר רצה
    if (!validateForm()) return;
    try {
        isSubmitting = true;
        ui.submitBtn.disabled = true;
        ui.submitBtn.textContent = 'שומר...';
        // 1. העלאת תמונה דרך ה-Service (במידה ונבחר קובץ חדש)
        let finalImageUrl = existingImageUrl;
        const imageFile = form.elements.imageUrl.files[0];
        if (imageFile) {
            const uploadResult = await uploadImage(imageFile);
            finalImageUrl = uploadResult.imageUrl; // ה-URL שהוחזר מ-uploadImageController
        }
        // 2. בניית אובייקט ה-JSON הנקי
        const isQuantityManaged = form.elements.hasQuantity.checked;
        const rawQuantity = form.elements.quantity.value;
        // 3. הוספתם לאובייקט ה-productData שנשלח לשרת
        const productData = {
            name: form.elements.name.value.trim(),
            price: Number(form.elements.price.value),
            description: form.elements.description.value.trim(),
            imageUrl: finalImageUrl,
            isPopular: form.elements.isPopular.checked,
            quantity: isQuantityManaged && rawQuantity !== '' ? Number(rawQuantity) : null,
            isAvailable: isQuantityManaged
                ? (Number(rawQuantity) > 0)
                : form.elements.isAvailable.checked,
            size: optionsManager.collectSizesData(),         // קריאה לפונקציה מהמודול
            options: optionsManager.collectSelectedOptions() // קריאה לפונקציה מהמודול
        };
    // 3. שמירת המוצר דרך ה-Service
    if (productId) {
        await updateProduct(productId, productData);
    } else {
        await addProduct(productData);
    }
    window.location.href = 'admin-products.html';
} catch (error) {
    isSubmitting = false;
    ui.submitBtn.disabled = false;
    ui.submitBtn.textContent = productId ? '💾 עדכון מוצר' : '✨ שמירת מוצר';
}
};
const hasSizesCheckbox = document.getElementById('hasSizes');
const sizesSectionWrapper = document.getElementById('sizes-section-wrapper');
const sizesListContainer = document.getElementById('sizes-list');
const addSizeBtn = document.getElementById('add-size-btn');
const optionGroupsContainer = document.getElementById('option-groups-container');
// פונקציית הצגה/הסתרת אזור הגדלים
const toggleSizesSection = () => {
    const hasSizes = hasSizesCheckbox.checked;
    sizesSectionWrapper.classList.toggle('hidden', !hasSizes);
    if (hasSizes && sizesListContainer.children.length === 0) {
        sizesListContainer.appendChild(createSizeRow());
    }
};
hasSizesCheckbox.addEventListener('change', toggleSizesSection);
addSizeBtn.addEventListener('click', () => sizesListContainer.appendChild(createSizeRow()));
// 7. אתחול והאזנה לאירועים מרכזיים (Event Delegation)
if (initAdminPage()) {
    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get('id');
    if (productId) {
        loadExistingProduct(productId);
    } else {
        optionsManager.loadOptionGroups();
        updateLivePreview();
    }
    // האזנה מרוכזת לאירוע input על הטופס כולו!
    form.addEventListener('input', (event) => {
        // א. עדכון הכרטיס בלייב
        updateLivePreview();
        // ב. ניקוי שגיאה בזמן הקלדה: מוצאים את אלמנט השגיאה של השדה שכרגע מקלידים בו
        const fieldName = event.target.name;
        const errorElement = document.getElementById(`error-${fieldName}`);
        if (errorElement) {
            errorElement.textContent = ''; // הסרת השגיאה מיד ברגע שהתחיל להקליד!
        }
    });
    // האזנה לשינוי במתג המלאי
    form.elements.hasQuantity.addEventListener('change', () => {
        toggleInventoryFields();
        updateLivePreview();
    });
    setupOptionModal((newGroup) => optionsManager.loadOptionGroups([newGroup._id]));
    // הגשת הטופס
    form.addEventListener('submit', handleSubmit);
}