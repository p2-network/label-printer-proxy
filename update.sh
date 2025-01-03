#!/usr/bin/env bash

cd /opt/p2-network/label-printer-proxy/

git pull

launchctl bootstrap gui/$(id -u) nz.patrick.label-printer-proxy.plist

launchctl bootout gui/$(id -u) nz.patrick.label-printer-proxy.plist
