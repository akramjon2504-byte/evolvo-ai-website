// scripts/main.js

// --- YORDAMCHI FUNKSIYALAR ---

// Blog posti kartochkasini yaratish
function createPostCard(doc) {
    const post = doc.data();
    let mediaHtml = '';
    if (post.imageUrl) {
        mediaHtml = `<img src="${post.imageUrl}" alt="${post.title}" class="w-full h-48 object-cover">`;
    } else if (post.videoEmbed) {
        mediaHtml = `<div class="w-full h-48 bg-gray-200 flex items-center justify-center"><svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg></div>`;
    }
    return `
        <a href="post.html?id=${doc.id}" class="card rounded-2xl overflow-hidden group flex flex-col">
            ${mediaHtml}
            <div class="p-6 flex-grow flex flex-col">
                <p class="text-sm text-sky-500 font-semibold mb-2">${post.category || 'Yangilik'}</p>
                <h3 class="text-xl font-bold section-title mb-3 group-hover:text-sky-600 transition-colors flex-grow">${post.title}</h3>
                <p class="text-secondary-color">${post.summary}</p>
            </div>
        </a>
    `;
}

// Portfolio loyihasi kartochkasini yaratish
function createPortfolioCard(doc) {
    const item = doc.data();
    return `
        <a href="portfolio-item.html?id=${doc.id}" class="card rounded-2xl overflow-hidden group">
            <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-64 object-cover">
            <div class="p-6">
                <p class="text-sm text-sky-500 font-semibold mb-1">${item.client}</p>
                <h3 class="text-xl font-bold section-title mb-2">${item.title}</h3>
                <p class="text-secondary-color">${item.summary}</p>
            </div>
        </a>
    `;
}

// --- MA'LUMOTLARNI YUKLASH FUNKSIYALARI ---

async function loadLatestPosts() {
    console.log("Bosh sahifa uchun oxirgi maqolalarni yuklash boshlandi...");
    const container = document.getElementById('latest-posts-container');
    if (!container) return;
    try {
        const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').limit(3).get();
        if (snapshot.empty) { container.innerHTML = '<p class="col-span-full text-center">Hozircha maqolalar yo\'q.</p>'; return; }
        let postsHtml = '';
        snapshot.forEach(doc => { postsHtml += createPostCard(doc); });
        container.innerHTML = postsHtml;
        console.log("Oxirgi maqolalar muvaffaqiyatli yuklandi.");
    } catch (error) { console.error("Error loading latest posts: ", error); container.innerHTML = '<p class="col-span-full text-center">Maqolalarni yuklashda xatolik yuz berdi.</p>'; }
}

async function loadAllPosts() {
    console.log("Blog sahifasi uchun barcha maqolalarni yuklash boshlandi...");
    const grid = document.getElementById('posts-grid');
    if (!grid) return;
    try {
        const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) { grid.innerHTML = '<p class="col-span-full text-center">Hozircha maqolalar yo\'q.</p>'; return; }
        let postsHtml = '';
        snapshot.forEach(doc => { postsHtml += createPostCard(doc); });
        grid.innerHTML = postsHtml;
    } catch (error) { console.error("Error loading all posts: ", error); grid.innerHTML = '<p class="col-span-full text-center">Maqolalarni yuklashda xatolik yuz berdi.</p>'; }
}

async function loadSinglePost() {
    console.log("Bitta maqola sahifasini yuklash boshlandi...");
    const contentDiv = document.getElementById('post-content');
    if (!contentDiv) return;
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    if (!postId) { contentDiv.innerHTML = '<h1>Maqola topilmadi.</h1>'; return; }
    try {
        const doc = await db.collection('posts').doc(postId).get();
        if (!doc.exists) { contentDiv.innerHTML = '<h1>Maqola topilmadi.</h1>'; return; }
        const post = doc.data();
        
        document.title = `${post.title} - Evolvo AI Blog`;
        document.querySelector('meta[name="description"]').setAttribute("content", post.summary);

        let mediaHtml = '';
        if (post.videoEmbed) {
            mediaHtml = `<div class="responsive-video-container mb-8">${post.videoEmbed}</div>`;
        } else if (post.imageUrl) {
            mediaHtml = `<img src="${post.imageUrl}" alt="${post.title}" class="w-full rounded-lg shadow-lg mb-8">`;
        }

        const converter = new showdown.Converter();
        const htmlContent = converter.makeHtml(post.content);

        contentDiv.innerHTML = `
            ${mediaHtml}
            <p class="text-sky-500 font-semibold">${post.category}</p>
            <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-4">${post.title}</h1>
            <p class="text-slate-500 mb-8">Chop etildi: ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
            <div class="text-lg text-slate-700 leading-relaxed">${htmlContent}</div>
        `;
    } catch (error) { console.error("Error loading single post: ", error); contentDiv.innerHTML = '<h1>Maqolani yuklashda xatolik yuz berdi.</h1>'; }
}

async function loadLatestPortfolio() {
    console.log("Bosh sahifa uchun oxirgi loyihalarni yuklash boshlandi...");
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    try {
        const snapshot = await db.collection('portfolio').orderBy('createdAt', 'desc').limit(2).get();
        if (snapshot.empty) { container.innerHTML = '<p class="col-span-full text-center">Hozircha loyihalar yo\'q.</p>'; return; }
        let html = '';
        snapshot.forEach(doc => { html += createPortfolioCard(doc); });
        container.innerHTML = html;
        console.log("Oxirgi loyihalar muvaffaqiyatli yuklandi.");
    } catch (error) { console.error("Error loading latest portfolio: ", error); container.innerHTML = '<p class="col-span-full text-center">Loyihalarni yuklashda xatolik.</p>'; }
}

async function loadAllPortfolio() {
    console.log("Portfolio sahifasi uchun barcha loyihalarni yuklash boshlandi...");
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    try {
        const snapshot = await db.collection('portfolio').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) { grid.innerHTML = '<p class="col-span-full text-center">Hozircha loyihalar yo\'q.</p>'; return; }
        let html = '';
        snapshot.forEach(doc => { html += createPortfolioCard(doc); });
        grid.innerHTML = html;
    } catch (error) { console.error("Error loading all portfolio: ", error); grid.innerHTML = '<p class="col-span-full text-center">Loyihalarni yuklashda xatolik.</p>'; }
}

async function loadSinglePortfolioItem() {
    console.log("Bitta loyiha sahifasini yuklash boshlandi...");
    const contentDiv = document.getElementById('portfolio-item-content');
    if (!contentDiv) return;
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    if (!itemId) { contentDiv.innerHTML = '<h1>Loyiha topilmadi.</h1>'; return; }
    try {
        const doc = await db.collection('portfolio').doc(itemId).get();
        if (!doc.exists) { contentDiv.innerHTML = '<h1>Loyiha topilmadi.</h1>'; return; }
        const item = doc.data();
        document.title = `${item.title} - Evolvo AI Portfolio`;
        document.querySelector('meta[name="description"]').setAttribute("content", item.summary);

        let mediaHtml = '';
        if (item.videoEmbed) {
            mediaHtml = `<div class="responsive-video-container mb-8">${item.videoEmbed}</div>`;
        } else if (item.imageUrl) {
            mediaHtml = `<img src="${item.imageUrl}" alt="${item.title}" class="w-full rounded-lg shadow-lg mb-8">`;
        }
        
        const converter = new showdown.Converter();
        const htmlContent = converter.makeHtml(item.content);

        contentDiv.innerHTML = `
            ${mediaHtml}
            <p class="text-sky-500 font-semibold">Mijoz: ${item.client}</p>
            <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-4">${item.title}</h1>
            <p class="text-slate-500 mb-8">Amalga oshirildi: ${new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</p>
            <div class="text-lg text-slate-700 leading-relaxed">${htmlContent}</div>
        `;
    } catch (error) { console.error("Error loading portfolio item: ", error); contentDiv.innerHTML = '<h1>Loyihani yuklashda xatolik.</h1>'; }
}

// --- SAHIFANI YUKLASH UCHUN ASOSIY MANTIQ ---

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    console.log("Sahifa yuklandi. Joriy manzil:", path);

    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        console.log("Bosh sahifa aniqlandi. Funksiyalar chaqirilmoqda...");
        loadLatestPosts();
        loadLatestPortfolio();
    } else if (path.includes('blog.html')) {
        console.log("Blog sahifasi aniqlandi. Funksiya chaqirilmoqda...");
        loadAllPosts();
    } else if (path.includes('post.html')) {
        console.log("Bitta maqola sahifasi aniqlandi. Funksiya chaqirilmoqda...");
        loadSinglePost();
    } else if (path.includes('portfolio.html')) {
        console.log("Portfolio sahifasi aniqlandi. Funksiya chaqirilmoqda...");
        loadAllPortfolio();
    } else if (path.includes('portfolio-item.html')) {
        console.log("Bitta loyiha sahifasi aniqlandi. Funksiya chaqirilmoqda...");
        loadSinglePortfolioItem();
    }
});
