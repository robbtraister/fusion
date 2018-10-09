#!/bin/sh

cat <<EOB
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|$) {
      error_page                418 = @resolver;
      return                    418;
    }
EOB
