from builder import build
import os

build_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'build')

build(
    variable='template',
    source=os.path.join(build_dir, 'template.html'),
    target=os.path.join(build_dir, 'template.py')
)
