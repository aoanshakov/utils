import json
from css_html_js_minify import html_minify
import re
from os import path
from PIL import Image
import base64
from subprocess import Popen, PIPE

pattern = re.compile('{image:[a-zA-Z0-9-_]*}')


def beautify_css(style):
    sass = Popen(
        ['sass', '--stdin', '--no-source-map'],
        stdin=PIPE,
        stdout=PIPE,
        stderr=PIPE,
        universal_newlines=True,
        bufsize=0
    )

    sass.stdin.write(style)
    sass.stdin.close()

    return sass.stdout.read()


def encode_image(match, images_path):
    image_path = path.join(images_path, match.group().split(':')[1][:-1] + '.png')
    image = Image.open(image_path)
    width, height = image.size

    with open(image_path, 'rb') as image_r:
        return (
            'width: ' + str(width) + 'px; height: ' + str(height) + 'px; ' +
            'background: url(data:image/png;base64,' + str(base64.b64encode(image_r.read()), 'utf-8') + ');'
        )


def build_scss(scss_template_path, scss_result_path, images_path):
    with open(scss_template_path, 'r') as template_file:
        style = template_file.read()
        style = pattern.sub(lambda match: encode_image(match, images_path), style)
        style = beautify_css(style)

        with open(scss_result_path, 'w') as style_css_w:
            style_css_w.write(style)


def build_html(html_description_path, i18n_json_path):
    with open(i18n_json_path, 'r') as i18n_json_r:
        i18n = json.load(i18n_json_r)

        with open(html_description_path, 'r') as html_description:
            description = html_description.read()
            i18n['widget']['description'] = html_minify(description)

            with open(i18n_json_path, 'w') as i18n_json_w:
                i18n_json_w.write(json.dumps(i18n, ensure_ascii=False, indent=2))
