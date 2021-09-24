template = """<!DOCTYPE html>
<html>
<head>

<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script>var token = "{{ token }}";</script>

<script src="//api.bitrix24.com/api/v1/"></script>

<script>

function runApplication (currentValues) {
    currentValues = currentValues || {}
    var form = document.querySelector('form'),
        elements = form.elements,
        initialized = false;

    function getFormValues () {
        return Array.prototype.map.call(elements, function (element) {
            return [element.name, element.value];
        }).reduce(function (result, item) {
            result[item[0]] = item[1];
            return result;
        }, {});
    }

    function getVisibility () {
        var autoCallOn = getFormValues().auto_call_on;

        return {
            employee_id: autoCallOn == 'employee',
            scenario_id: autoCallOn == 'scenario',
            virtual_number_numb: autoCallOn != 'virtual_number',
            virtual_number: autoCallOn == 'virtual_number'
        };
    }

    function saveSettings () {
        if (!initialized) {
            return;
        }

        var values = getFormValues();
        
        Object.entries(getVisibility()).forEach(function (args) {
            var name = args[0],
                visibility = args[1];

            !visibility && (values[name] = '');
        });

        BX24.placement.call('setPropertyValue', values);
    }

    function updateVisibility () {
        Object.entries(getVisibility()).forEach(function (args) {
            var name = args[0],
                visibility = args[1];

            document.querySelector('[name=' + name + ']').closest('div').style.display = visibility ? 'block' : 'none';
        });
    }

    function request (args) {
        var url = '/api/v1/' + args.url,
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
        getText: function (record) {
            return ['last_name', 'first_name'].map(function (name) {
                return record[name];
            }).filter(function (value) {
                return value;
            }).join(' ');
        }
    }, {
        names: ['virtual_number_numb', 'virtual_number'],
        dataUrl: 'number_capacity?with_scenario=1',
        valueField: 'numb',
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

        function createOptions (data) {
            var isEmpty = !data || !data.length;

            selectFields.forEach(function (selectField) {
                var options = isEmpty ? [createOption({
                    value: '',
                    text: '...'
                })] : [];

                (data || []).forEach(function (record) {
                    var value = record[params.valueField || 'id'];

                    options.push(createOption({
                        value: value,
                        text: params.getText ? params.getText(record) : record[params.displayField],
                        selected: currentValues[selectField.name] == value
                    }))
                });

                selectField.innerHTML = options.join('');
                !isEmpty && (selectField.disabled = false);
            });

            saveSettings();
        }

        createOptions();

        request({
            url: params.dataUrl,
            callback: createOptions
        });
    });

    currentValues.employee_message && (document.querySelector('textarea').innerHTML = currentValues.employee_message);

    const autoCallOnSelect = document.querySelector('select[name="auto_call_on"]');
    
    autoCallOnSelect.addEventListener('change', updateVisibility);
    autoCallOnSelect.value = currentValues.auto_call_on || 'personal_manager';

    Array.prototype.forEach.call(elements, function (element) {
        (element.nodeName.toLowerCase() == 'textarea' ? ['keyup', 'change'] : ['change']).forEach(function (eventName) {
            element.addEventListener(eventName, saveSettings);
        });
    });

    form.style.display = 'none';

    BX24.init(function () {
        initialized = true;
        saveSettings();

        form.style.display = 'block';
    });

    updateVisibility();
}

</script>

<style>

select, button {
    height: 30px;
    background: #fff;
    border: 1px solid #000;
}

select[disabled], button[disabled] {
    cursor: not-allowed;
    color: #ccc;
}

select, textarea {
    width: 100%;
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
            <label>{{ properties.auto_call_on.NAME }}:</label>

            <select name="auto_call_on">
                {% for key, value in properties.auto_call_on.OPTIONS.items() %}
                <option value="{{ key }}">{{ value }}</option>
                {% endfor %}
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
    </form>
</body>
</html>
"""
