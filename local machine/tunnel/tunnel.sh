#!/bin/sh

PARAMS="-o ExitOnForwardFailure=yes -o ServerAliveInterval=60 -o StrictHostKeyChecking=no -v"
CMD="ssh -f -N -i /root/.ssh/tunnel -R ${REMOTE_HOST}:${REMOTE_PORT}:${LOCAL_HOST}:${LOCAL_PORT} ${SSH_KEY_USER}@${SSH_HOST} ${PARAMS}"

echo ""
echo "Establishing SSH Reverse Tunnel with:"
echo ""
echo $CMD
echo ""
echo ""
echo ""

while true
do
    eval "${CMD}"
    sleep 180
done