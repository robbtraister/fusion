#!/bin/sh

cat <<EOB
    # strip trailing slashes
    location ~ ^${API_PREFIX}/(fuse|make)(/.*)/\$ {
      rewrite                   (.*)/\$ \$1 last;
    }
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|\$) {
      set                       \$p \$2;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @resolver;

      set                       \$target ${S3_HOST}/environments/\${environment}/html/\${arcSite}/\${outputType}\$p;
      proxy_pass                \$target;

      add_header                'Fusion-Source' 's3';
    }
EOB
