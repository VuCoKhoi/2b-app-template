#!/bin/bash

sudo apt update
sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx -y


# sudo certbot --nginx -d avarareporting.shopavara.com 