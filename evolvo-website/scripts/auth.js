// scripts/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const path = window.location.pathname;

    // Foydalanuvchi tizimga kirgan yoki kirmaganini tekshirish
    auth.onAuthStateChanged(user => {
        if (user) {
            // Agar foydalanuvchi kirgan bo'lsa
            if (path.includes('login.html')) {
                // va u login sahifasida bo'lsa, uni admin panelga yo'naltirish
                window.location.replace('admin.html');
            } else if (path.includes('admin.html')) {
                // Agar u admin panelda bo'lsa, panelni ko'rsatish va ma'lumotlarni yuklash
                document.getElementById('admin-panel').classList.remove('hidden');
                setupAdminPanel(auth, db);
            }
        } else {
            // Agar foydalanuvchi kirmagan bo'lsa
            if (path.includes('admin.html') || path.includes('post-editor.html') || path.includes('portfolio-editor.html')) {
                // va u himoyalangan sahifalarga kirmoqchi bo'lsa, uni login sahifasiga yo'naltirish
                window.location.replace('login.html');
            }
        }
    });

    // Login formasi uchun
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const errorMessage = document.getElementById('error-message');

            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    errorMessage.textContent = 'Email yoki parol noto\'g\'ri.';
                });
        });
    }
});

// Admin panelni sozlash va ma'lumotlarni yuklash
function setupAdminPanel(auth, db) {
    // Chiqish tugmasi
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut();
        });
    }

    // Tablar
    const tabContacts = document.getElementById('tab-contacts');
    const tabPosts = document.getElementById('tab-posts');
    const tabPortfolio = document.getElementById('tab-portfolio');
    const contentContacts = document.getElementById('content-contacts');
    const contentPosts = document.getElementById('content-posts');
    const contentPortfolio = document.getElementById('content-portfolio');

    function switchTab(activeTab, activeContent) {
        // Barcha tablarni nofaol qilish
        [tabContacts, tabPosts, tabPortfolio].forEach(tab => tab.classList.remove('tab-active'));
        // Barcha kontentni yashirish
        [contentContacts, contentPosts, contentPortfolio].forEach(content => content.classList.add('hidden'));
        // Keraklisini faollashtirish
        activeTab.classList.add('tab-active');
        activeContent.classList.remove('hidden');
    }

    tabContacts.addEventListener('click', () => switchTab(tabContacts, contentContacts));
    tabPosts.addEventListener('click', () => switchTab(tabPosts, contentPosts));
    tabPortfolio.addEventListener('click', () => switchTab(tabPortfolio, contentPortfolio));

    // Ma'lumotlarni yuklash
    loadContacts(db);
    loadAdminPosts(db);
    loadAdminPortfolio(db);
}

// Kontakt so'rovlarini yuklash
async function loadContacts(db) {
    const container = document.getElementById('contacts-list');
    if (!container) return;
    try {
        const snapshot = await db.collection('contacts').orderBy('submittedAt', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = '<p class="p-4">Hozircha so\'rovlar yo\'q.</p>';
            return;
        }
        let html = '<ul class="divide-y divide-gray-200">';
        snapshot.forEach(doc => {
            const contact = doc.data();
            const date = new Date(contact.submittedAt.seconds * 1000).toLocaleString();
            html += `<li class="p-4"><div class="flex justify-between"><p class="font-semibold text-gray-900">${contact.name}</p><p class="text-sm text-gray-500">${date}</p></div><p class="text-gray-700">${contact.phone}</p><p class="mt-2 text-gray-600">${contact.message}</p></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    } catch (error) {
        console.error("Error loading contacts: ", error);
        container.innerHTML = '<p class="p-4 text-red-500">So\'rovlarni yuklashda xatolik.</p>';
    }
}

// Maqolalar ro'yxatini yuklash
async function loadAdminPosts(db) {
    const container = document.getElementById('posts-list');
    if (!container) return;
    try {
        const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = '<p class="p-4">Hozircha maqolalar yo\'q.</p>';
            return;
        }
        let html = '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sarlavha</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategoriya</th><th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">';
        snapshot.forEach(doc => {
            const post = doc.data();
            html += `<tr id="post-${doc.id}"><td class="px-6 py-4 text-sm text-gray-900">${post.title}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.category}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="post-editor.html?id=${doc.id}" class="text-sky-600 hover:text-sky-900 mr-4">Tahrirlash</a><button data-id="${doc.id}" class="delete-post-button text-red-600 hover:text-red-900">O\'chirish</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        document.querySelectorAll('.delete-post-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const postId = e.target.dataset.id;
                if (confirm('Haqiqatdan ham bu maqolani o\'chirmoqchimisiz?')) {
                    await db.collection('posts').doc(postId).delete();
                    document.getElementById(`post-${postId}`).remove();
                }
            });
        });
    } catch (error) {
        console.error("Error loading posts for admin: ", error);
        container.innerHTML = '<p class="p-4 text-red-500">Maqolalarni yuklashda xatolik.</p>';
    }
}

// Portfolio ro'yxatini yuklash
async function loadAdminPortfolio(db) {
    const container = document.getElementById('portfolio-list');
    if (!container) return;
    try {
        const snapshot = await db.collection('portfolio').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = '<p class="p-4">Hozircha loyihalar yo\'q.</p>';
            return;
        }
        let html = '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyiha</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mijoz</th><th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">';
        snapshot.forEach(doc => {
            const item = doc.data();
            html += `<tr id="portfolio-${doc.id}"><td class="px-6 py-4 text-sm text-gray-900">${item.title}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.client}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="portfolio-editor.html?id=${doc.id}" class="text-sky-600 hover:text-sky-900 mr-4">Tahrirlash</a><button data-id="${doc.id}" class="delete-portfolio-button text-red-600 hover:text-red-900">O\'chirish</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        document.querySelectorAll('.delete-portfolio-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                if (confirm('Haqiqatdan ham bu loyihani o\'chirmoqchimisiz?')) {
                    await db.collection('portfolio').doc(itemId).delete();
                    document.getElementById(`portfolio-${itemId}`).remove();
                }
            });
        });
    } catch (error) {
        console.error("Error loading portfolio for admin: ", error);
        container.innerHTML = '<p class="p-4 text-red-500">Loyihalarni yuklashda xatolik.</p>';
    }
}
