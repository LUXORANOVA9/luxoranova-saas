
#!/bin/bash

echo "📦 Adding all files to Git..."
git add .

echo "💫 Committing final LuxoraNova version..."
git commit -m "🚀 Final LuxoraNova push: n8n + Streamlit + Worker"

echo "🌐 Pushing to GitHub main branch..."
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ GitHub push succeeded. Render will auto-deploy now."
else
  echo "❌ GitHub push failed. Check your SSH token or remote origin."
fi
