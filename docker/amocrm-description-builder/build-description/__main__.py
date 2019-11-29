from description_builder import build_html, build_scss
import sys

{
    'html': lambda: build_html(html_description_path=sys.argv[2], i18n_json_path=sys.argv[3]),
    'scss': lambda: build_scss(scss_template_path=sys.argv[2], scss_result_path=sys.argv[3], images_path=sys.argv[4])
}[sys.argv[1]]()
