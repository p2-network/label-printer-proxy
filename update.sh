#!/usr/bin/env zsh

cd /opt/p2-network/label-printer-proxy/

git pull

# if launchd job is running
if launchctl list | grep -q nz.patrick.label-printer-proxy; then
  echo "Unloading service..."
  launchctl bootout gui/$(id -u) nz.patrick.label-printer-proxy.plist
fi

echo "Loading service..."

launchctl bootstrap gui/$(id -u) nz.patrick.label-printer-proxy.plist
