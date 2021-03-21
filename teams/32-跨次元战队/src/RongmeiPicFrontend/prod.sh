#!/usr/bin/env bash
ssh -T ubuntu@dimension.pub <<'ENDSSH'
      cd /var/www/html
      rm -rf pic
      mv pictemp pic
ENDSSH
