#!/bin/bash

sudo fallocate -l 4G /swapfile

sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

sudo -- bash -c 'echo "/swapfile swap swap defaults 0 0" >>/etc/fstab'
