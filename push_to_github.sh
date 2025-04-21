
#!/bin/bash

echo "🔐 Setting GitHub config..."
git config --global user.email "ci@luxoranova.ai"
git config --global user.name "LuxoraNovaBot"

echo "📁 Adding files to Git commit..."
git add .
git commit -m "👑 Push LuxoraNova core: custom node, trigger, test, admin UI, and scheduler"

echo "🚀 Pushing to GitHub origin main..."
git push origin main

if [ $? -eq 0 ]; then
  echo "✅ GitHub push complete. Triggering Render dual deploy..."  # assumes Render Git integration is already live
else
  echo "❌ GitHub push failed. Check your SSH token or remote origin."
fi
