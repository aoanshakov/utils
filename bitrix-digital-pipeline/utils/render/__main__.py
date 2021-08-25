from renderer import render
import sys

render(
    variables=sys.argv[1],
    template=sys.argv[2],
    target=sys.argv[3]
)
