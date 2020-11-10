#!/bin/bash
cd ~
pwd
sudo npm install
sudo mkdir webAppLogs
sudo touch webAppLogs/webapp.log
sudo chmod 666 webAppLogs/webapp.log
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:./cloudwatch-config.json \
    -s