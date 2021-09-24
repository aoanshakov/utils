import ast
import astor

def build(variable, source, target):
    with open(source, 'r') as html:
        with open(target, 'w') as py:
            root = ast.parse(variable + ' = ""')
            root.body[0].value.s = html.read()

            py.write(astor.to_source(root))
