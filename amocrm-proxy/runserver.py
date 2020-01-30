# -*- coding: utf-8 -*-

from flask import Flask, jsonify, request
import json
import requests
import logging
from http.client import HTTPConnection

logger = logging.getLogger('urllib3')
logger.setLevel(logging.DEBUG)
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
logger.addHandler(stream_handler)
HTTPConnection.debuglevel = 1

application = Flask('amocrm-proxy')
# server = 'https://proxy.dev.uis.st:15015'
server = 'https://my2.comagic.ru'


def handle(target):
    data = json.loads(request.form.get('data', '{}'))
    method = data.get('method', 'get')
    token = data.get('token', '')
    params = data.get('params', {})
    url = server + target

    response = getattr(requests, method)(
        url,
        params=params if method == 'get' else None,
        data=json.dumps(params) if method != 'get' else None,
        timeout=10,
        headers={
            'Authorization': 'Bearer %s' % (token)
        } if token else None
    )

    content = response.content.decode('utf-8')
    logger.info('Response body: %s' % (content))

    try:
        return jsonify(response.json())
    except BaseException:
        return jsonify({
            'data': (content)
        })


@application.route('/sup/auth/login', methods=['POST'])
def login():
    return handle('/sup/auth/login')


@application.route('/sup/auth/check', methods=['POST'])
def check():
    return handle('/sup/auth/check')


@application.route('/sup/api/v1/settings', methods=['POST'])
def settings():
    return handle('/sup/api/v1/settings')


@application.route('/sup/api/v1/numa/<numa>', methods=['POST'])
def numa(numa):
    return handle('/sup/api/v1/numa/' + numa)


@application.route('/sup/api/v1/users/me', methods=['POST'])
def me():
    return handle('/sup/api/v1/users/me')


@application.route('/sup/api/v1/users/me/calls', methods=['POST'])
def calls():
    return handle('/sup/api/v1/users/me/calls')


application.run('0.0.0.0', '80', debug=True)
