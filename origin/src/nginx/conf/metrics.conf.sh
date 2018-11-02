#!/bin/sh

cat <<EOB
    statsd_timing             "arc.fusion.origin.latency#nile_env:${NILE_ENV},environment:\${environment},arcSite:\${arcSite}" "\$request_time";
EOB