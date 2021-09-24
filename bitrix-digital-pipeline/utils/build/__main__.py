from builder import build
import sys

build(
    variable='template',
    source=sys.argv[1],
    target=sys.argv[2]
)
