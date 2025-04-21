
#!/bin/bash

# ---------------------------------------------
# 🧠 Auto GitHub Push Script for LuxoraNova
# ---------------------------------------------

cd "$(dirname "$0")"

echo "🔄 Starting automated Git push process..."

# Configure Git if needed
if [ -z "$(git config --global user.email)" ]; then
  git config --global user.email "ci@luxoranova.ai"
  git config --global user.name "LuxoraNovaBot"
fi

echo "🚀 Committing all changes..."
git add .
git commit -m "🤖 Hourly Auto Push via Render Scheduler"

# Push with feedback
if git push origin main; then
  echo "✅ GitHub push successful."
  echo "🔄 Render will auto-deploy via Git integration"
else
  echo "❌ GitHub push failed. Check SSH token or remote origin."
  exit 1
fi
