#!/usr/bin/env bash
ssh -T ubuntu@dimension.pub <<'ENDSSH'
      cd /var/www/html
      rm -rf picmobile
      mv picmobiletemp picmobile
ENDSSH