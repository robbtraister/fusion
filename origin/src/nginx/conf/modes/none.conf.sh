#!/bin/sh

cat <<EOB
    location ~ ^${API_PREFIX}/(fuse|make)(/.*|\$) {
EOB

$(dirname "$0")/../metrics.conf.sh
$(dirname "$0")/../locations/resolver.conf.sh

cat <<EOB
    }
EOB
