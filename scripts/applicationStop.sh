#!/bin/bash
echo "getting the process id"
PID=`pgrep -f 'node server.js'`
if [[ "" !=  "$PID" ]]; then
  echo "Found node application running on $PID"
  echo "killing the process to stop application"
  echo "killing $PID"
  sudo kill -9 $PID
fi
