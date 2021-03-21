#!/usr/bin/env bash
ssh -T root@rongmeitech.com <<'ENDSSH'
      project_dir="/root/project/RongmeiPicMobile"  #代码被部署的目录
      cd $project_dir #进入代码目录
      build_dist='/var/www/html/picmobile' #编译好的目录
      rm -rf $build_dist #删除之前编译好nginx指向的文件
      cp -R build $build_dist #复制到编译好的文件到 nginx指向的目录
ENDSSH