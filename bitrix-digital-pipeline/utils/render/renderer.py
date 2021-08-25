import json
from io import open
from jinja2 import Template

def render(variables, template, target):
    with open(template, 'r', encoding='utf-8') as template_reader:
        with open(variables, 'r', encoding='utf-8') as variables_reader:
            with open(target, 'w', encoding='utf-8') as target_writer:
                target_writer.write(Template(template_reader.read()).render(json.loads(variables_reader.read())))
