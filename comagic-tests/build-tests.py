# -*- coding: utf-8 -*-
from mock import Mock
import sys
import os.path
import json
import flask

flask.request = Mock()
flask.request.host = '127.0.0.1:80'

comagic_web_directory = '/usr/local/src/comagic_web'
application_name = sys.argv[1]
lang = sys.argv[2] if len(sys.argv) > 2 else 'ru'
test_name = sys.argv[3] if len(sys.argv) > 3 else None

comagic_directory = os.path.join(comagic_web_directory, 'comagic')

sys.path.append(comagic_web_directory)

tests_directory = os.path.abspath(os.path.dirname(__file__))
html_directory = os.path.join(tests_directory, 'html', application_name)

for file in os.listdir(html_directory):
    if file != '.keep':
        os.unlink(os.path.join(html_directory, file))

with open(os.path.join(tests_directory, 'tests.json'), 'r') as file:
    tests = json.load(file)
    tests = tests.get(application_name, {})

import comagic.lmc

comagic.lmc.get_lc = Mock()
comagic.lmc.get_lc.return_value = 'ru'

from comagic.assets import ComagicAssets
from comagic.easystart.assets import EasyStartAssets
import flask.ext.assets

config = {
    'comagic': {
        'page_data': {
            'g': {
                'lc': 'ru',
                'user_name': u'Администратор',
                'user_id': '2870',
                'agent_user_id': '0',
                'system_user_id': '',
                'customer_id': '183510',
                'project': 'comagic',
                'csrf_token': 'yqEef4jrWZevPHTT-91TUw=='
            },
            'billing_currency': 'rub',
            'permissions': '{}',
            'available_components': [],
            'landings': '{}',
            'is_tutored': True,
            'is_show_promo_notification': False,
            'sso_token': '941e4pYkQmivgYQxdg4GTSmBfHi3T6uAOC76V7DThoEvsOENtsrJojyEAXhY4YoYPZR1YA',
            'tickets_count_with_new_comments': 0,
            'app_state': 'active',
            'app_login': 'qa@uiscom.ru',
            'app_id': '1103',
            'user_type': 'admin',
            'app_page_title': 'CoMagic',
            'url_favicon': '/static/comagic/resources2/images/interfaces/main/favicon-comagic.ico',
            'theme': 'comagic',
            'is_agents_app': False,
            'is_tp_share': False,
            'is_tp_trial': False,
            'timezone': 'Europe/Moscow',
            'crm_type': None,
            'debug_mode': 'dev',
            'comagic_app_url': 'https://go.comagic.ru/',
            'url_logo': '/static/comagic/resources2/images/interfaces/main/logo-comagic.png',
            'url_small_logo': '/static/comagic/resources2/images/interfaces/main/logo-comagic-small.png',
            'agent_url_logo': '',
            'app_page_title': 'CoMagic',
            'url_agreement': 'https://www.comagic.ru/upload/iblock/78b/agreement.pdf',
            'url_idea_portal': 'https://help.comagic.ru/',
            'url_detailed_instructions': 'https://help.comagic.ru/2480-integratsiya-konsultanta-s-yandeksdialogami',
            'url_static_tags_to_crm_instructions': 'https://help.comagic.ru/2501-nastrojka-i-peredacha',
            'voip_server': 'voip.uiscom.ru',
            'notification_http_request_ip': '195.211.120.37',
            'payments_info_text': '',
            'payments_status': True,
            'web_ip': '',
            'url_pricing': '',
            'uis_or_comagic': '&#34;comagic&#34;',
            'config': {
                'USE_EMBED_CODE': False,
                'JS_USER_EVENT_TRACKING_INTERVAL': None
            }
        },
        'test_files': [],
        'template_folder': tests_directory,
        'template_name': 'comagic',
        'assets_class': ComagicAssets
    },
    'easystart': {
        'page_data': {
            'test_mode': True,
            'debug_mode': 'dev',
            'app_page_title': 'UIS',
            'domain_data': {
                'project': 'uis2'
            },
            'application_state': json.dumps({
                'data': {},
                'success': True,
                'partner': 'bitrix'
            }),
            'extra_params': json.dumps({
                'csrf_token': '5J1g2krEwONRMPqgx-N40Q=='
            }) 
        },
        'template_folder': os.path.join(comagic_directory, 'templates'),
        'template_name': 'easystart',
        'assets_class': EasyStartAssets
    }
}

config = config.get(application_name, None)

if not config:
    raise Exception('Invalid application name "' + application_name + '"')

os.chdir(comagic_directory)


def create_html_file(test_name):
    test_files = [
        '/tests/jasmine/lib/jasmine-3.4.0/jasmine.js',
        '/tests/jasmine/lib/jasmine-3.4.0/jasmine-html.js',
        '/tests/jasmine/lib/jasmine-3.4.0/boot.js',
        '/tests/jasmine/lib/jasmine-ajax/lib/mock-ajax.js',
        '/tests/jasmine/console-reporter.js',
        '/tests/js/js-tester.js',
        '/tests/js/extjs-tester.js',
        '/tests/js/define-global-tester.js'
    ]

    for path in tests[test_name]:
        test_files.append('/tests/js/' + path)

    test_files.append('/tests/js/' + application_name + '-app.js')
    app = flask.Flask('Test', template_folder=config.get('template_folder'))
    assets = config.get('assets_class')(app=app)
    assets.env.debug = True

    assets.env.register('test', flask.ext.assets.Bundle(*test_files))

    with app.app_context():
        with open(os.path.join(html_directory, test_name + '.html'), 'w') as file:
            file.write(flask.render_template(
                config.get('template_name') + '.html',
                gen_path='/'.join((assets.env.url, assets.gen_path)),
                **config.get('page_data')
            ).encode('utf8'))


if test_name:
    create_html_file(test_name)
else:
    for test_name in tests:
        create_html_file(test_name)
