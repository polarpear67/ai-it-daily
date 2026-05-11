#!/bin/bash
# Push daily HK news update to GitHub Pages
# Usage: push-hk-update.sh <date> "<json_news_data>"

cd "$(dirname "$0")"

DATE="$1"
JSON_DATA="$2"

if [ -z "$DATE" ] || [ -z "$JSON_DATA" ]; then
    echo "Usage: push-hk-update.sh YYYY-MM-DD '<json_array>'"
    exit 1
fi

# Update HK news data
CURRENT_DATA=$(cat data-hk/news-hk.json 2>/dev/null || echo "{}")
echo "$CURRENT_DATA" | node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
data['$DATE'] = $JSON_DATA;
fs.writeFileSync('data-hk/news-hk.json', JSON.stringify(data, null, 2));
console.log('Merged HK news');
"

# Generate the static HK daily page
node -e "
const fs = require('fs');
const path = require('path');

const date = '$DATE';
const data = JSON.parse(fs.readFileSync('data-hk/news-hk.json', 'utf8'));
const items = data[date];
if (!items || items.length === 0) { console.error('No news'); process.exit(1); }

const page = \`<!DOCTYPE html>
<html lang=\"zh-HK\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>\${date} — 香港新聞</title>
    <base href=\"/ai-it-daily/\">
    <link rel=\"stylesheet\" href=\"../../style.css\">
    <link rel=\"stylesheet\" href=\"../hk-style.css\">
</head>
<body>
    <header>
        <div class=\"header-content\">
            <h1>🇭🇰 香港本地新聞</h1>
            <p class=\"subtitle\">\${date}</p>
            <nav>
                <a href=\"../..\" class=\"nav-dashboard\">🏠 主頁</a>
                <a href=\"../\">香港新聞</a>
                <a href=\"../archive-hk/\">歷史記錄</a>
            </nav>
        </div>
    </header>

    <main>
        <div class=\"date-badge\">\${date} 🇭🇰</div>
        \${items.map((item, i) => \`
        <div class=\"news-card\">
            <div class=\"news-rank\">\${i + 1}</div>
            <h2>\${item.title}</h2>
            <div class=\"news-source\">\${item.source || '來源不詳'}</div>
            <div class=\"news-summary\">\${item.summary}</div>
            <a class=\"news-link\" href=\"\${item.url}\" target=\"_blank\" rel=\"noopener\">閱讀全文 →</a>
        </div>\`).join('')}
    </main>

    <footer>
        <p>由 Polar 🐻‍❄️ 為你準備 | <a href=\"https://github.com/polarpear67/ai-it-daily\">GitHub</a></p>
    </footer>
</body>
</html>\`;

const dir = 'hk-news/news-hk';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, date + '.html'), page);
console.log('Generated hk-news/news-hk/' + date + '.html');
"

# Configure git
git config user.name "Polar 🐻‍❄️"
git config user.email "polar@daily-news-bot"

# Commit and push
git add -A
git commit -m "🇭🇰 HK daily news update - $DATE"
git push origin main

echo "✅ Published HK news for $DATE"
