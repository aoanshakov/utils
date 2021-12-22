import ast
import os
import json
import binascii
import astor


class ConstantParam(object):
    def __init__(self, node):
        self.node = node

    def get_name(self):
        for target in self.node.targets:
            if isinstance(target, ast.Name):
                return target.id

    def set_value(self, value):
        self.node.value = value

    def get_value(self):
        return self.node.value


class DictParam(object):
    def __init__(self, node, index):
        if not isinstance(node, ast.Dict):
            raise Exception('Cannot set object value for node with type ' + str(type(node)))

        self.node = node
        self.index = index

    def get_name(self):
        key = self.node.keys[self.index]

        if not isinstance(key, ast.Str):
            raise Exception('Key type ' + str(type(key)) + ' is not supported')

        return key.s

    def set_value(self, value):
        self.node.values[self.index] = value

    def get_value(self):
        return self.node.values[self.index]


def get_ast_value(value):
    value_type = type(value)

    if value_type is str:
        return ast.Str(s=value)
    elif value_type is int or value_type is float:
        return ast.Num(n=value)
    elif value_type is bool or value is None:
        return ast.NameConstant(value=value)
    else:
        raise Exception('Type ' + str(value_type) + ' is not supported')


def each_assign_node(parent, callback):
    for node in ast.iter_child_nodes(parent):
        if isinstance(node, ast.Assign):
            callback(ConstantParam(node))


def each_dict_item(parent, callback):
    for index, key in enumerate(parent.keys):
        callback(DictParam(parent, index))


def override_param(param, new_values):
    name = param.get_name()

    if name in new_values:
        value = new_values[name]

        if type(value) is dict:
            override_params(
                traverser=each_dict_item,
                parent=param.get_value(),
                new_values=value
            )
        else:
            param.set_value(get_ast_value(value))


def override_params(traverser, parent, new_values):
    traverser(
        parent=parent,
        callback=lambda param: override_param(
            param=param,
            new_values=new_values
        )
    )


def override_file(
    original_config_path,
    overriden_config_path,
    original_config_preparer,
    new_values,
    callback
):
    with open(original_config_path, 'r') as original_config:
        with open(overriden_config_path, 'w') as overriden_config:
            root = ast.parse(original_config_preparer(original_config.read()))
            callback(root)

            override_params(
                traverser=each_assign_node,
                parent=root,
                new_values=new_values
            )

            overriden_config.write("# -*- coding:utf-8 -*-\n\n" + astor.to_source(root))


def handle_config(
    path,
    original_config_preparer=lambda code: code,
    new_values={},
    callback=lambda root: None
):
    override_file(
        original_config_path=path + '.txt',
        overriden_config_path=path + '.py',
        original_config_preparer=original_config_preparer,
        new_values=new_values,
        callback=callback
    )


def prepare_local_config(config):
    config = config.replace('PORT = #8004 ', 'PORT = 8080')
    config = config.replace(
        'SECRET_KEY = # import os; os.urandom(24)',
        'SECRET_KEY = \'' + binascii.hexlify(os.urandom(24)).decode('latin1') + '\''
    )

    return config


def get_local_config_db_new_values(new_values):
    new_values = new_values.get('local_config_db')
    postfix = new_values.get('postfix')

    if not postfix:
        return new_values

    defaults = {
        'postfix': postfix,
        'port': new_values.get('port', '6900'),
        'host': new_values.get('host', 'lynx.uis')
    }

    return {
        'comagic': defaults.copy(),
        'billing': defaults.copy(),
        'infopin': defaults.copy()
    }


def get_local_config_new_values(new_values):
    values = {
        'HOST': '0.0.0.0',
        'REDIS_CONF': {
            'host': 'dev.uis.st'
        }
    }

    values.update(new_values.get('local_config', {}))
    return values


def maybe_change_project(project, root):
    if project == 'comagic':
        return

    root.body.append(ast.Assign(
        targets=[ast.Subscript(
            value=ast.Subscript(
                value=ast.Name(id='DOMAIN_DATA', ctx=ast.Load()),
                slice=ast.Index(value=ast.UnaryOp(op=ast.USub(), operand=ast.Num(n=1))),
                ctx=ast.Load()
            ),
            slice=ast.Index(value=ast.Str(s='project')),
            ctx=ast.Store()
        )],
        value=ast.Str(s='uis2')
    ))


def configure(new_values_path, comagic_web_path):
    with open(new_values_path) as new_values:
        new_values = json.load(new_values)

        handle_config(
            path=os.path.join(comagic_web_path, 'comagic', 'local_config'),
            original_config_preparer=prepare_local_config,
            new_values=get_local_config_new_values(new_values),
            callback=lambda root: maybe_change_project(
                new_values.get('project', 'comagic'),
                root
            )
        )

        handle_config(
            path=os.path.join(comagic_web_path, 'local_config_db'),
            new_values=get_local_config_db_new_values(new_values)
        )
