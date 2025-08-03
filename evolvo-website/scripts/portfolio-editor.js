// scripts/portfolio-editor.js

document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const form = document.getElementById('portfolio-form');
    const editorTitle = document.getElementById('editor-title');
    const saveButton = document.getElementById('save-button');

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    let isEditing = itemId !== null;

    // Foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga yuborish
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.replace('login.html');
        }
    });

    // Agar tahrirlash rejimi bo'lsa, ma'lumotlarni yuklash
    if (isEditing) {
        editorTitle.textContent = 'Loyihani Tahrirlash';
        db.collection('portfolio').doc(itemId).get().then(doc => {
            if (doc.exists) {
                const item = doc.data();
                form.title.value = item.title;
                form.client.value = item.client;
                form.imageUrl.value = item.imageUrl || '';
                form.summary.value = item.summary;
                form.content.value = item.content;
            } else {
                alert('Loyiha topilmadi!');
                window.location.replace('admin.html');
            }
        }).catch(error => {
            console.error("Error getting document:", error);
            alert('Loyihani yuklashda xatolik yuz berdi.');
        });
    }

    // Formani saqlash
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Saqlanmoqda...';

        const portfolioData = {
            title: form.title.value,
            client: form.client.value,
            imageUrl: form.imageUrl.value,
            summary: form.summary.value,
            content: form.content.value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Agar tahrirlash bo'lsa, eski sanani saqlab qolish
        if (isEditing) {
            try {
                const existingDoc = await db.collection('portfolio').doc(itemId).get();
                if (existingDoc.exists) {
                    portfolioData.createdAt = existingDoc.data().createdAt;
                }
            } catch (error) {
                console.error("Could not get existing doc timestamp:", error);
            }
        }

        try {
            if (isEditing) {
                // Mavjudini yangilash
                await db.collection('portfolio').doc(itemId).set(portfolioData, { merge: true });
            } else {
                // Yangisini qo'shish
                await db.collection('portfolio').add(portfolioData);
            }
            alert('Loyiha muvaffaqiyatli saqlandi!');
            window.location.replace('admin.html');
        } catch (error) {
            console.error("Error saving portfolio item: ", error);
            alert('Loyihani saqlashda xatolik yuz berdi.');
            saveButton.disabled = false;
            saveButton.textContent = 'Saqlash';
        }
    });
});