async function loadHKNews() {
    try {
        const resp = await fetch('data-hk/news-hk.json');
        const data = await resp.json();
        
        const dates = Object.keys(data).sort().reverse();
        
        if (document.getElementById('hk-news-list')) {
            renderTodayHK(dates, data);
        }
        if (document.getElementById('hk-archive-list')) {
            renderArchiveHK(dates, data);
        }
    } catch (e) {
        const containers = ['hk-news-list', 'hk-archive-list'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<div class="loading">暫時未有新聞 — 明早 8 點再來看看！</div>';
        });
    }
}

function renderTodayHK(dates, data) {
    const container = document.getElementById('hk-news-list');
    const today = dates[0];
    
    if (!today) {
        container.innerHTML = '<div class="loading">暫時未有新聞 — 明早 8 點再來看看！</div>';
        return;
    }
    
    document.getElementById('current-date').textContent = today + ' 🇭🇰';
    
    const items = data[today];
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="loading">今日暫無新聞。</div>';
        return;
    }
    
    container.innerHTML = items.map((item, i) => `
        <div class="news-card">
            <div class="news-rank">${i + 1}</div>
            <h2>${item.title}</h2>
            <div class="news-source">${item.source || '來源不詳'}</div>
            <div class="news-summary">${item.summary}</div>
            <a class="news-link" href="${item.url}" target="_blank" rel="noopener">閱讀全文 →</a>
        </div>
    `).join('');
}

function renderArchiveHK(dates, data) {
    const container = document.getElementById('hk-archive-list');
    
    if (dates.length === 0) {
        container.innerHTML = '<div class="loading">暫無歷史記錄。</div>';
        return;
    }
    
    container.innerHTML = dates.map(date => {
        const count = data[date] ? data[date].length : 0;
        return `
            <div class="archive-item">
                <a href="hk-news/news-hk/${date}.html">${date}</a>
                <span class="archive-count">${count} 則新聞</span>
            </div>
        `;
    }).join('');
}

loadHKNews();
