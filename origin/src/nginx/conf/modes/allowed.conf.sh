#!/bin/sh

cat <<EOB
    # strip trailing slashes
    location ~ ^${API_PREFIX}/(fuse|make)(/.*)/$ {
      set                       \$p \$2;
      rewrite                   ^ ${API_PREFIX}/make\$p;
    }
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|$) {
      set                       \$p \$2;

      proxy_intercept_errors    on;
      error_page                400 403 404 418 500 502 503 504 = @backup;

      proxy_set_header          'Fusion-Cache-Mode' \$cacheMode;

EOB

. $(dirname "$0")/../locations/resolver.conf.sh

cat <<EOB
    }

    location @backup {
      set                       \$target ${S3_HOST}/environments/\${environment}/html/\${arcSite}/\${outputType}\$p;
      proxy_pass                \$target;

      add_header                'Fusion-Source' 's3';
    }
EOB
