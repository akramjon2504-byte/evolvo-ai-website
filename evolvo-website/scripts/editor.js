// scripts/editor.js

document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    const form = document.getElementById('post-form');
    const editorTitle = document.getElementById('editor-title');
    const saveButton = document.getElementById('save-button');

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    let isEditing = postId !== null;

    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.replace('login.html');
        }
    });

    if (isEditing) {
        editorTitle.textContent = 'Maqolani Tahrirlash';
        db.collection('posts').doc(postId).get().then(doc => {
            if (doc.exists) {
                const post = doc.data();
                form.title.value = post.title;
                form.imageUrl.value = post.imageUrl || '';
                form.videoEmbed.value = post.videoEmbed || ''; // Video kodini yuklash
                form.category.value = post.category;
                form.summary.value = post.summary;
                form.content.value = post.content;
            } else {
                alert('Maqola topilmadi!');
                window.location.replace('admin.html');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Saqlanmoqda...';

        const postData = {
            title: form.title.value,
            imageUrl: form.imageUrl.value,
            videoEmbed: form.videoEmbed.value, // Video kodini saqlash
            category: form.category.value,
            summary: form.summary.value,
            content: form.content.value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (isEditing) {
            const existingDoc = await db.collection('posts').doc(postId).get();
            if (existingDoc.exists) {
                postData.createdAt = existingDoc.data().createdAt;
            }
        }

        try {
            if (isEditing) {
                await db.collection('posts').doc(postId).set(postData, { merge: true });
            } else {
                await db.collection('posts').add(postData);
            }
            alert('Maqola muvaffaqiyatli saqlandi!');
            window.location.replace('admin.html');
        } catch (error) {
            console.error("Error saving post: ", error);
            alert('Maqolani saqlashda xatolik yuz berdi.');
            saveButton.disabled = false;
            saveButton.textContent = 'Saqlash';
        }
    });
});
