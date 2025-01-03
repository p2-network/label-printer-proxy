#!/usr/bin/env zsh

cd /opt/p2-network/label-printer-proxy/

git pull

# if launchd job is running
if launchctl list | grep -q nz.patrick.label-printer-proxy; then
  echo "Unloading service..."
  launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/nz.patrick.label-printer-proxy.plist
fi

cp nz.patrick.label-printer-proxy.plist ~/Library/LaunchAgents

echo "Loading service..."

launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/nz.patrick.label-printer-proxy.plist
