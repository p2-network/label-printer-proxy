#!/usr/bin/env zsh

cd /opt/p2-network/label-printer-proxy/

git pull

launchctl bootout gui/$(id -u) nz.patrick.label-printer-proxy.plist

launchctl bootstrap gui/$(id -u) nz.patrick.label-printer-proxy.plist
