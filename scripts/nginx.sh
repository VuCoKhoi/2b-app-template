#!/bin/bash

sudo apt update
sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx


# sudo certbot --nginx -d example.com -d www.example.com