#!/bin/sh

cat <<EOB
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|$) {
      set                       \$p \$2.html;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 500 502 503 504 = @backup;

      proxy_set_header          'Fusion-Cache-HTML' 'true';

EOB

. $(dirname "$0")/../locations/resolver.conf.sh

cat <<EOB
    }

    location @backup {
      set                       \$target ${S3_HOST}/environments/\${environment}/deployments/\${version}/html/\${arcSite}/\${outputType}\$p;
      proxy_pass                \$target;
    }
EOB
