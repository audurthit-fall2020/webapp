#!/bin/bash
cd ~
pwd
sudo npm install
sudo mkdir logs
sudo touch logs/webapp.log
sudo chmod 666 logs/webapp.log
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:./cloudwatch-config.json \
    -s