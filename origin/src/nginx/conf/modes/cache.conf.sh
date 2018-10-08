#!/bin/sh

cat <<EOB
    # strip trailing slashes
    location ~ ^${API_PREFIX}/(fuse|make)(/.*)/$ {
      set                       \$p \$2;
      rewrite                   ^ ${API_PREFIX}/(fuse|make)\$p;
    }
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|$) {
      set                       \$p \$2;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @resolver;

      proxy_set_header          'Fusion-Cache-HTML' 'true';

      set                       \$target ${S3_HOST}/environments/\${environment}/html/\${arcSite}/\${outputType}\$p;
      proxy_pass                \$target;

      add_header                'Fusion-Source' 's3';
    }
EOB
