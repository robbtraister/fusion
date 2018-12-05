#!/bin/sh

cat <<EOB
    statsd_timing             "arc.fusion.origin.latency#nile_env:${NILE_ENV},environment:\${environment},arc_site:\${arcSite},status_code:\${status}" "\$request_time";
EOB
