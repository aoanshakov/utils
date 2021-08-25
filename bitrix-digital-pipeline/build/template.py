# -*- coding:utf-8 -*-

template = """<!DOCTYPE html>
<html>
<head>


<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script>var token = "{{ token }}";</script>

<script src="//api.bitrix24.com/api/v1/"></script>

<script>

function runApplication (currentValues) {
    currentValues = currentValues || {}
    BX24.init(function() {});

    function getFormValues () {
        return Array.prototype.map.call(document.querySelector('form').elements, function (element) {
            return [element.name, element.value];
        }).filter(function (item) {
            return item[0];
        }).reduce(function (result, item) {
            result[item[0]] = item[1];
            return result;
        }, {});
    }

    function getVisibility () {
        var autoCallOn = getFormValues().autocall_on;

        return {
            employee_id: autoCallOn == 'employee_id',
            scenario_id: autoCallOn == 'scenario_id',
            employee_message: autoCallOn != 'scenario_id',
            virtual_number_numb: autoCallOn != 'virtual_number',
            virtual_number: autoCallOn == 'virtual_number'
        };
    }

    function updateVisibility () {
        Object.entries(getVisibility()).forEach(function (args) {
            var name = args[0],
                visibility = args[1];

            document.querySelector('[name=' + name + ']').style.display = visibility ? 'block' : 'none';
        });
    }

    function request (args) {
        var url = '/sup/api/v1/' + args.url,
            callback = args.callback || function () {},
            request = new XMLHttpRequest();

        request.addEventListener('load', function () {
            var data;

            try {
                data = JSON.parse(this.responseText)
            } catch (e) {
                data = null;
            }

            callback((data || {}).data);
        });

        request.addEventListener('error', function () {
            callback(null);
        });

        request.open('GET', url);
        request.setRequestHeader('Authorization', 'Bearer ' + token);

        request.send();
    }

    function createOption (args) {
        var value = args.value,
            text = args.text,
            selected = args.selected;

        return '<option ' + (selected ? 'selected ' : '') + 'value="' + value + '">' + text + '</option>';
    }

    [{
        names: ['employee_id'],
        dataUrl: 'users',
        displayField: 'full_name'
    }, {
        names: ['virtual_number_numb', 'virtual_number'],
        dataUrl: 'number_capacity?with_scenario=1',
        params: {
            with_scenario: 1
        },
        displayField: 'numb'
    }, {
        names: ['scenario_id'],
        dataUrl: 'scenario',
        displayField: 'name'
    }].forEach(function (params) {
        var names = params.names;

        var selectFields = document.querySelectorAll(names.map(function (name) {
            return 'select[name=' + name + ']'
        }).join(','));

        selectFields.forEach(function (selectField) {
            selectField.disabled = true
        });

        request({
            url: params.dataUrl,
            callback: function (data) {
                selectFields.forEach(function (selectField) {
                    var options = [createOption({
                        value: '',
                        text: '...'
                    })];

                    (data || []).forEach(function (record) {
                        var value = record.id;

                        options.push(createOption({
                            value: value,
                            text: record[params.displayField],
                            selected: currentValues[selectField.name] == value
                        }))
                    });

                    selectField.innerHTML = options.join('');
                    selectField.disabled = false
                });
            }
        });
    });

    currentValues.employee_message && (document.querySelector('textarea').innerHTML = currentValues.employee_message);

    document.querySelector('button').addEventListener('click', function (event) {
        event.preventDefault();
        var values = getFormValues();
        
        Object.entries(getVisibility()).forEach(function (args) {
            var name = args[0],
                visibility = args[1];

            !visibility && (values[name] = '');
        });

        BX24.placement.call('setPropertyValue', values);
    });

    const autoCallOnSelect = document.querySelector('select[name="autocall_on"]');
    
    autoCallOnSelect.addEventListener('change', updateVisibility);
    autoCallOnSelect.value = currentValues.autocall_on || 'personal_manager';

    updateVisibility();
}

</script>

<style>

select, button {
    height: 30px;
    background: #fff;
    border: 1px solid #000;
}

select, textarea {
    width: 300px;
    box-sizing: border-box;
}

textarea {
    height: 100px;
    padding: 10px;
}

label {
    margin-bottom: 15px;
    display: block;
}

body {
    padding: 20px;
}

body, textarea {
    font-family: sans-serif;
    font-size: 14px;
}

div {
    margin-bottom: 25px;
}

</style>

<script>document.addEventListener("DOMContentLoaded", function () {runApplication({{ current_values|safe }});})</script>

</head>

<body>
    <form>
        <div>
            <label>{{ properties.autocall_on.NAME }}:</label>

            <select name="autocall_on">
                <option value="personal_manager">{{ to_personal_manager }}</option>
                <option value="employee_id">{{ properties.employee_id.NAME }}</option>
                <option value="virtual_number">{{ properties.virtual_number.NAME }}</option>
                <option value="scenario_id">{{ properties.scenario_id.NAME }}</option>
            </select>
        </div>

        <div>
            <select name="employee_id"></select>
        </div>

        <div>
            <select name="virtual_number"></select>
        </div>

        <div>
            <select name="scenario_id"></select>
        </div>

        <div>
            <label>{{ properties.virtual_number_numb.NAME }}:</label>
            <select name="virtual_number_numb"></select>
        </div>

        <div>
            <label>{{ properties.employee_message.NAME }}:</label>
            <textarea name="employee_message"></textarea>
        </div>

        <button>{{ submit_button_text }}</button>
    </form>
</body>
</html>
"""
