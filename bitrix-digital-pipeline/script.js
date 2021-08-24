function runApplication (currentValues) {
    currentValues = currentValues || {}
    BX24.init(function() {});

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
        name: 'employee_id',
        dataUrl: 'users',
        displayField: 'full_name'
    }, {
        name: 'virtual_number_numb',
        dataUrl: 'number_capacity?with_scenario=1',
        params: {
            with_scenario: 1
        },
        displayField: 'numb'
    }, {
        name: 'scenario_id',
        dataUrl: 'scenario',
        displayField: 'name'
    }].forEach(function (params) {
        var name = params.name;

        var selectField = document.querySelector('select[name=' + name + ']'),
            options = [createOption({
                value: '',
                text: '...'
            })];

        selectField.disabled = true;

        request({
            url: params.dataUrl,
            callback: function (data) {
                (data || []).forEach(function (record) {
                    var value = record.id;

                    options.push(createOption({
                        value: value,
                        text: record[params.displayField],
                        selected: currentValues[name] == value
                    }))
                });

                selectField.innerHTML = options.join('');
                selectField.disabled = false;
            }
        });
    });

    currentValues.employee_message && (document.querySelector('textarea').innerHTML = currentValues.employee_message);

    document.querySelector('button').addEventListener('click', function (event) {
        event.preventDefault();

        BX24.placement.call(
            'setPropertyValue',

            Array.prototype.map.call(document.querySelector('form').elements, function (element) {
                return [element.name, element.value];
            }).filter(function (item) {
                return item[0];
            }).reduce(function (result, item) {
                result[item[0]] = item[1];
                return result;
            }, {})
        );
    });
}
