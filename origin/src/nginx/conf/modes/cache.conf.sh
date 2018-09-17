#!/bin/sh

cat <<EOB
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|$) {
      set                       \$p \$2.html;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 = @resolver;

      proxy_set_header          'Fusion-Render-Cache' 'true';

      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/html/\${outputType}\$p;
      proxy_pass                \$target;
    }
EOB
