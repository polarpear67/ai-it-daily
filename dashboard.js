async function loadDashboard() {
    const recentList = document.getElementById('recent-list');
    
    try {
        // Load both news data sources
        const [aiResp, hkResp] = await Promise.all([
            fetch('data/news.json'),
            fetch('data-hk/news-hk.json')
        ]);
        
        const aiData = await aiResp.json();
        const hkData = await hkResp.json();
        
        // Update meta info on cards
        const aiDates = Object.keys(aiData).sort().reverse();
        const hkDates = Object.keys(hkData).sort().reverse();
        
        const metaAI = document.getElementById('meta-ai');
        const metaHK = document.getElementById('meta-hk');
        const cardAI = document.getElementById('card-ai');
        const cardHK = document.getElementById('card-hk');
        
        if (aiDates.length > 0) {
            metaAI.textContent = '📅 ' + aiDates[0];
            cardAI.href = 'news/' + aiDates[0] + '.html';
        } else {
            metaAI.textContent = '暫無資料';
        }
        
        if (hkDates.length > 0) {
            metaHK.textContent = '📅 ' + hkDates[0];
        } else {
            metaHK.textContent = '暫無資料';
        }
        
        // Build recent updates timeline
        const updates = [];
        
        aiDates.forEach(date => {
            const items = aiData[date];
            if (items && items.length > 0) {
                updates.push({
                    date,
                    tag: 'AI & IT',
                    tagClass: 'tag-ai',
                    url: 'news/' + date + '.html',
                    label: items[0].title.substring(0, 50) + (items[0].title.length > 50 ? '...' : '') + ' (+' + (items.length - 1) + ' more)'
                });
            }
        });
        
        hkDates.forEach(date => {
            const items = hkData[date];
            if (items && items.length > 0) {
                updates.push({
                    date,
                    tag: '🇭🇰 香港',
                    tagClass: 'tag-hk',
                    url: 'hk-news/news-hk/' + date + '.html',
                    label: items[0].title.substring(0, 50) + (items[0].title.length > 50 ? '...' : '') + ' (+' + (items.length - 1) + ' more)'
                });
            }
        });
        
        updates.sort((a, b) => b.date.localeCompare(a.date));
        
        if (updates.length === 0) {
            recentList.innerHTML = '<div class="loading">暫無更新記錄。</div>';
            return;
        }
        
        recentList.innerHTML = updates.map(up => `
            <div class="recent-item">
                <a href="${up.url}">${up.label}</a>
                <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
                    <span style="color:var(--muted);font-size:0.8rem;">${up.date}</span>
                    <span class="recent-item-tag ${up.tagClass}">${up.tag}</span>
                </div>
            </div>
        `).join('');
        
    } catch (e) {
        recentList.innerHTML = '<div class="loading">無法載入更新記錄。</div>';
    }
}

loadDashboard();
