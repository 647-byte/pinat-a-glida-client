/**
 * Initializes image selection, drag-and-drop file upload, and object URL management for product forms.
 * 
 * @function initImageManager
 * @param {HTMLFormElement} form - The product form element containing the image input.
 * @param {Function} updateLivePreviewCallback - Callback function to update the live preview with the new image URL.
 * @returns {Object} An object containing utility methods for the image manager.
 */
export const initImageManager = (form, updateLivePreviewCallback) => {
    let currentObjectUrl = null;
    const dropZone = document.getElementById('drop-zone');
    const thumbImg = document.getElementById('thumb-img');
    // מופעלת אך ורק כשנבחר/נזרק קובץ חדש
    const handleFileSelection = (file) => {
        if (file) {
            if (currentObjectUrl) {
                URL.revokeObjectURL(currentObjectUrl);
            }
            currentObjectUrl = URL.createObjectURL(file);
        }
        updateLivePreviewCallback(currentObjectUrl);
    };
    // ניהול אירועי Drag & Drop לריבוע העלאת התמונה
    const setupDragAndDrop = () => {
        if (!dropZone) return;
        // 1. כשהעכבר נכנס לאזור הגרירה (dragenter) או זז מעליו (dragover)
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault(); // "דפדפן יקר, אל תפתח את התמונה בלשונית חדשה!"
                e.stopPropagation(); // עורר עצירה של האירוע שלא יעלה לאלמנטים אבות
                dropZone.classList.add('dragover'); // הוספת מחלקת CSS (למשל: מסגרת כתומה/בולטת)
            });
        });

        // 2. כשהעכבר יוצא מאזור הגרירה (dragleave) או כשהמשתמש משחרר את הקובץ (drop)
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('dragover'); // הסרת העיצוב הבולט (החזרה למצב רגיל)
            });
        });
        dropZone.addEventListener('drop', (e) => {
            // 1. שליפת הקבצים שהמשתמש גלל מתוך אירוע הגרירה
            const droppedFiles = e.dataTransfer.files;
            // 2. בדיקה שבכלל נגרר קובץ תקין (ולא סתם טקסט)
            if (droppedFiles && droppedFiles.length > 0) {
                // 3. הצעד הקריטי: עדכון ה-Input המוסתר של הטופס!
                form.elements.imageUrl.files = droppedFiles;
                // 4. עדכון התצוגה המקדימה
                handleFileSelection(droppedFiles[0]);
                // 5. ניקוי הודעת שגיאה אם הייתה
                const errorElement = document.getElementById('error-imageUrl');
                if (errorElement) errorElement.textContent = '';
            }
        });
    }
    //  האזנה לשינוי בקובץ ה-Input
    form.elements.imageUrl.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    });
    setupDragAndDrop();

    return {
        getCurrentObjectUrl: () => currentObjectUrl
    };
};