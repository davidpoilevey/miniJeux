#!/bin/bash

# Variables à adapter
USER="david"
IP="192.168.1.191"
DEST="/opt/homelab/server"

echo "🚀 Synchronisation vers le mini-PC..."
  rsync -avz --exclude 'node_modules' ./server/ david@bmax:/opt/homelab/server/ 


echo "✅ Déploiement terminé !"
