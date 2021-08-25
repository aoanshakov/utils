function runApplication (currentValues) {
    currentValues = currentValues || {}

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

            document.querySelector('[name=' + name + ']').closest('div').style.display = visibility ? 'block' : 'none';
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
                    var value = record.id;

                    options.push(createOption({
                        value: value,
                        text: record[params.displayField],
                        selected: currentValues[selectField.name] == value
                    }))
                });

                selectField.innerHTML = options.join('');
                !isEmpty && (selectField.disabled = false);
            });
        }

        createOptions();

        request({
            url: params.dataUrl,
            callback: createOptions
        });
    });

    currentValues.employee_message && (document.querySelector('textarea').innerHTML = currentValues.employee_message);

    const autoCallOnSelect = document.querySelector('select[name="autocall_on"]');
    
    autoCallOnSelect.addEventListener('change', updateVisibility);
    autoCallOnSelect.value = currentValues.autocall_on || 'personal_manager';

    const button = document.querySelector('button');
    button.disabled = true;

    BX24.init(function() {
        button.disabled = false;
    });

    button.addEventListener('click', function (event) {
        event.preventDefault();
        var values = getFormValues();
        
        Object.entries(getVisibility()).forEach(function (args) {
            var name = args[0],
                visibility = args[1];

            !visibility && (values[name] = '');
        });

        BX24.placement.call('setPropertyValue', values);
    });

    updateVisibility();
}
