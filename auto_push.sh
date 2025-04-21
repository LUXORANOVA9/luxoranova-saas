
#!/bin/bash

echo "🔄 Starting automated Git push..."

git add .
git commit -m "🧠 Auto-push from LuxoraNova Replit Cron"
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to GitHub"
else
  echo "❌ Failed to push to GitHub"
fi
