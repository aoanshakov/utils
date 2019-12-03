tests.requireClass('Comagic.base.form.field.MaskedText');

tests.addTest(function(requestsManager, testersFactory, wait, utils) {
   describe(
       'Создаю поле для ввода российского номера телефона, не позволяющее превысить количество цифр.',
   function() {
        var phoneField, form, formTester;

        beforeEach(function() {
            phoneField = Ext.create('Comagic.base.form.field.MaskedText', {
                fieldLabel: 'Phone',
                width: 500,
                allowExceedNumbersCount: false,
                inputMask: '+7 (___) ___-__-__'
            });

            form = Ext.create('Ext.form.Panel', {
                items: [phoneField]
            });

            Comagic.getApplication().addToViewport(form);
            formTester = testersFactory.createFormTester(form);

            phoneField.updateInvalidityMark();
        });

        it('Ввожу больше цифр, чем следует. Лишние цифры не вводятся.', function() {
            formTester.textfield().withFieldLabel('Phone').input('4951234567123');
            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
        });
        it('Вставляю больше цифр, чем следует. Лишние цифры не вставляются.', function() {
            formTester.textfield().withFieldLabel('Phone').paste('4951234567123');
            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
        });
    });
    describe('Создаю обязательное для заполнения поле для ввода российского номера телефона.', function() {
        var phoneField, form, formTester;

        beforeEach(function() {
            phoneField = Ext.create('Comagic.base.form.field.MaskedText', {
                fieldLabel: 'Phone',
                width: 500,
                allowBlank: false,
                inputMask: '+7 (___) ___-__-__'
            });

            form = Ext.create('Ext.form.Panel', {
                items: [phoneField]
            });

            Comagic.getApplication().addToViewport(form);
            formTester = testersFactory.createFormTester(form);

            phoneField.updateInvalidityMark();
        });

        it('Поле отмечено как невалидное.', function() {
            formTester.textfield().withFieldLabel('Phone').expectToHaveError('Это поле обязательно для заполнения');
        });
        describe('Ввожу номер телефона.', function() {
            beforeEach(function() {
                formTester.textfield().withFieldLabel('Phone').input('4951234567');
            });

            it('Поле считается валидным.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveNoError();
            });
            it('Стираю значение в поле. Поле отмечено как невалидное.', function() {
                formTester.textfield().withFieldLabel('Phone').clear();
                formTester.textfield().withFieldLabel('Phone').expectToHaveError('Это поле обязательно для заполнения');
            });
        });
    });
    describe('Создаю но не рендерю поле для ввода российского номера телефона.', function() {
        var phoneField, form, formTester;

        beforeEach(function() {
            phoneField = Ext.create('Comagic.base.form.field.MaskedText', {
                fieldLabel: 'Phone',
                width: 500,
                inputMask: '+7 (___) ___-__-__'
            });

            form = Ext.create('Ext.form.Panel', {
                items: [phoneField]
            });
        });

        it([
            'Используя метод setValue() устанавливаю значение из десяти ',
            'цифр, со случайным символами. Отображается корректно ',
            'отформатированный номер.'
        ].join(''), function() {
            phoneField.setValue('49##(G)5FEJH12*()34567');

            Comagic.getApplication().addToViewport(form);
            formTester = testersFactory.createFormTester(form);

            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
        });
    });
    describe('Существует поле для ввода российского номера телефона.', function() {
        var phoneField, form, formTester;

        function testInsertingValue(actionDescription, methodName) {
            describe([
                actionDescription, ' номер телефона со случайными символами.'
            ].join(''), function() {
                var newValueReturnedByMethod, newValuePassedAsArgument, fieldPassedAsArgument;

                beforeEach(function() {
                    newValueReturnedByMethod = null;
                    fieldPassedAsArgument = null;

                    phoneField.on('change', function(field, newValue) {
                        fieldPassedAsArgument = field;
                        newValueReturnedByMethod = phoneField.getValue();
                        newValuePassedAsArgument = newValue;
                    });

                    formTester.textfield().withFieldLabel('Phone')[methodName]('*&*495.@12)(#$&**@@GRdd)3#4567');
                });

                it('Отображается корректно отформатированный номер.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
                });
                it('Метод getValue() возвращает числовое значение номера.', function() {
                    expect(phoneField.getValue()).toBe(74951234567);
                    expect(newValuePassedAsArgument).toBe(74951234567);
                    expect(newValueReturnedByMethod).toBe(74951234567);
                    expect(phoneField == fieldPassedAsArgument).toBe(true);
                });
            });
            describe(actionDescription + ' номер частично.', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone')[methodName]('*&*434.@)(#$&**@@GRdd)#567');
                });

                it('Номер корректно отформатирован.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (434) 567-__-__');
                });
                describe([
                    actionDescription, ' слишком много цифр в середину.'
                ].join(''), function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').putCursorAt(5);

                        formTester.textfield().withFieldLabel('Phone')[methodName](
                            '*&*9R5I@)(#$&**@@G1dd)#20*#()9()284#*17#5$$'
                        );
                    });

                    it('Цифры корректно добавлены.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 120-92-8417534567');
                    });
                    it('Курсор расположен после последней добавленной цифры.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(21);
                    });
                });
                it([
                    'Добавляю цифры перед последней цифрой в скобках. Метод getValue() возвращает измененное числовое ',
                    'значение.'
                ].join(''), function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(6);
                    formTester.textfield().withFieldLabel('Phone')[methodName]('*$(F#)12*#El3*)@4)');

                    expect(phoneField.getValue()).toBe(74312344567);
                });
                it([
                    'Добавляю цифры перед закрывающей скобкой. Метод getValue() возвращает измененное числовое ',
                    'значение.'
                ].join(''), function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(7);
                    formTester.textfield().withFieldLabel('Phone')[methodName]('*$(F#)12*#El3*)@4)');

                    expect(phoneField.getValue()).toBe(74341234567);
                });
                it((
                    'Добавляю цифры после закрывающей скобки. Метод getValue() возвращает измененное числовое значение.'
                ), function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(8);
                    formTester.textfield().withFieldLabel('Phone')[methodName]('*$(F#)12*#El3*)@4)');

                    expect(phoneField.getValue()).toBe(74341234567);
                });
                it([
                    'Добавляю цифры после пробела, следующего за закрывающей скобкой. Метод getValue() возвращает ',
                    'измененное числовое значение.'
                ].join(''), function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(9);
                    formTester.textfield().withFieldLabel('Phone')[methodName]('*$(F#)12*#El3*)@4)');

                    expect(phoneField.getValue()).toBe(74341234567);
                });
                it([
                    'Добавляю цифры после первой цифры, следующей за кодом ',
                    'в скобках. Метод getValue() возвращает измененное ',
                    'числовое значение.'
                ].join(''), function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(10);
                    formTester.textfield().withFieldLabel('Phone')[methodName]('*$(F#)12*#El3*)@4)');

                    expect(phoneField.getValue()).toBe(74345123467);
                });
                describe([
                    actionDescription, ' недостающую часть номера в середину.'
                ].join(''), function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').putCursorAt(5);
                        formTester.textfield().withFieldLabel('Phone')[methodName]('*&*9R5Y@)(#$&**@@G1dd)#2$$');
                    });

                    it('Цифры корректно добавлены.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
                    });
                    it('Курсор расположен после последней добавленной цифры.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(11);
                    });
                    it('Метод getValue() возвращает числовое значение номера.', function() {
                        expect(phoneField.getValue()).toBe(74951234567);
                    });
                });
            });
            describe([
                actionDescription, ' слишком много цифр со случайными символами.'
            ].join(''), function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone')[methodName](
                        '#f@$*9495#*($)123456#(*%^^)7#**(k32&#43**##*5)'
                    );
                });

                it('Все символы, вышедшие за предел маски добавлены в конец.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-56732435');
                });
                it('Курсор перемещен в конец поля.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAtEnd();
                });
                describe([
                    'Выделяю часть номера полностью выходящую за предел маски. ', actionDescription, ' цифры номера ',
                    'со случайными символами.'
                ].join(''), function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').select(19, 23);
                        formTester.textfield().withFieldLabel('Phone')[methodName]('1#$gg234##5&6');
                    });

                    it('Цифры корректно заменены.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-5671234565');
                    });
                    it('Курсор расположен после последнего добавленного символа.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(25);
                    });
                });
                describe([
                    'Выделяю часть номера частично выходящую за предел маски. ', actionDescription, ' цифры номера со ',
                    'случайными символами.'
                ].join(''), function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').select(10, 22);
                        formTester.textfield().withFieldLabel('Phone')[methodName]('1#$gg234');
                    });

                    it('Цифры корректно заменены.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-35');
                    });
                    it('Курсор расположен после последнего добавленного символа.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(15);
                    });
                });
            });
            it([
                actionDescription, ' одиннадцать цифр со случайными символами, первая из которых не восьмерка и не ',
                'семерка. Цифра в начале не обрезается. Последняя цифра добавляется в конец.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('#f@$*9495#*($)123456#(*%^^)7');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-567');
            });
            describe([
                actionDescription, ' десять цифр.'
            ].join(''), function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone')[methodName]('4951234567');
                });

                it('Отображается корректно отформатированный номер к которому спереди добавлена семерка.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
                });
                it('Курсор расположен в конце поля.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAtEnd();
                });
                describe('Выделяю часть номера: "495) 12".', function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').select(4, 11);
                    });
                    
                    describe([
                        actionDescription, ' ровно столько цифр, сколько было выделено.',
                    ].join(''), function() {
                        beforeEach(function() {
                            formTester.textfield().withFieldLabel('Phone')[methodName]('91*6#*(##$)%%###$$)38');
                        });

                        it('Цифры номера корректно заменены.', function() {
                            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (916) 383-45-67');
                        });
                        it([
                            'Курсор расположен перед следующим символом после той цифры, которая была добавлена ',
                            'последней.'
                        ].join(''), function() {
                            formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(11);
                        });
                    });
                    describe([
                        actionDescription, ' чуть меньше цифр, чем было выделено.',
                    ].join(''), function() {
                        beforeEach(function() {
                            formTester.textfield().withFieldLabel('Phone')[methodName](
                                '91*6#*(##$)%%###$$)3#*@fdfsfij&#'
                            );
                        });

                        it('Цифры номера корректно заменены.', function() {
                            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (916) 334-56-7_');
                        });
                        it([
                            'Курсор расположен перед следующим символом после той цифры, которая была добавлена ',
                            'последней.'
                        ].join(''), function() {
                            formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(10);
                        });
                    });
                    describe([
                        actionDescription, ' чуть больше цифр, чем было выделено.',
                    ].join(''), function() {
                        beforeEach(function() {
                            formTester.textfield().withFieldLabel('Phone')[methodName]('91*#FJ6#)(F)381');
                        });

                        it('Те цифры, которые выходят за пределы маски были добавлены в конце.', function() {
                            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (916) 381-34-567');
                        });
                        it([
                            'Курсор расположен перед следующим символом после той цифры, которая была добавлена ',
                            'последней.'
                        ].join(''), function() {
                            formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(12);
                        });
                    });
                });
            });
            it([
                actionDescription, ' начинающийся с "+7" отформатированный номер частично. Семерка в начале не ',
                'считается кодом страны.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('+7 (49');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (749) ___-__-__');
            });
            it([
                actionDescription, ' номер частично. Отображается частично и при этом корректно отформатирован.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('&*49');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (49_) ___-__-__');
            });
            it([
                actionDescription, 'номер в котором часть цифр заменены на символ "#". Символ "#" игнорируется.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('+7 (##4) 95');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (749) 5__-__-__');
            });
            it([
                actionDescription, ' номер телефона в соответствии с форматом. Код страны отображается в скобках, как ',
                'часть кода города. Номер невалиден.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('+7 (495) 123-45-67');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (749) 512-34-567');
            });
            it([
                actionDescription, ' одиннадцать цифр, начиная с семерки. Код страны отображается в скобках, как ',
                'часть кода города. Номер невалиден.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('74951234567');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (749) 512-34-567');
            });
            it([
                actionDescription, ' одиннадцать цифр, начиная с восьмерки. Восьмерка в начале не обрезается. Код ',
                'страны отображается в скобках, как часть кода города. Номер невалиден.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('84951234567');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (849) 512-34-567');
            });
            it([
                actionDescription, ' десять цифр, начиная с восьмерки. Восьмерка в начале не обрезается.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone')[methodName]('8495123456');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (849) 512-34-56');
            });
        }

        beforeEach(function() {
            phoneField = Ext.create('Comagic.base.form.field.MaskedText', {
                fieldLabel: 'Phone',
                width: 500,
                inputMask: '+7 (___) ___-__-__'
            });

            form = Ext.create('Ext.form.Panel', {
                items: [phoneField]
            });

            Comagic.getApplication().addToViewport(form);

            formTester = testersFactory.createFormTester(form);
        });

        it('Значеним поля является маска "+7 (___) ___-__-__".', function() {
            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (___) ___-__-__');
        });
        it('Поле считается валидным.', function() {
            formTester.textfield().withFieldLabel('Phone').expectToHaveNoError();
        });
        it([
            'Ввожу номер частично. Устанавливаю курсор подальше от последней введенной цифры. Ввожу еще одну цифру. ',
            'Новая цифра появляется непосредственно после последней введенной.'
        ].join(''), function() {
            formTester.textfield().withFieldLabel('Phone').input('4951');
            formTester.textfield().withFieldLabel('Phone').putCursorAt(13);
            formTester.textfield().withFieldLabel('Phone').input('2');
            formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 12_-__-__');
        });
        describe(
            'Используя метод setValue() устанавливаю значение из десяти цифр, со случайным символами.',
        function() {
            beforeEach(function() {
                phoneField.setValue('49##(G)5FEJH12*()34567');
            });

            it('Отображается корректно отформатированный номер.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
            });
            it('Метод getValue() возвращает корректное значение.', function() {
                expect(phoneField.getValue()).toBe(74951234567);
            });
            it('Используя метод setValue() устанавливаю пустое значение. Отображается маска.', function() {
                phoneField.setValue(null);
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (___) ___-__-__');
            });
        });
        describe(
            'Используя метод setValue() устанавливаю значение из одиннадцати цифр, начиная с восьмерки.',
        function() {
            beforeEach(function() {
                phoneField.setValue('84951234567');
            });

            it('Восьмерка в начале не обрезается. Номер некорректен.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (849) 512-34-567');
            });
            it('Метод getValue() возвращает значение из двенадцати цифр, начинающееся с цифр 7 и 8.', function() {
                expect(phoneField.getValue()).toBe(784951234567);
            });
        });
        describe([
            'Используя метод setValue() устанавливаю значение из одиннадцати цифр, начиная с цифры, которая не ',
            'является ни восьмеркой ни семеркой.'
        ].join(''), function() {
            beforeEach(function() {
                phoneField.setValue('94951234567');
            });

            it('Цифра в начале не обрезается.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-567');
            });
            it('Метод getValue() возвращает значение из двенадцати цифр.', function() {
                expect(phoneField.getValue()).toBe(794951234567);
            });
        });
        describe(
            'Используя метод setValue() устанавливаю в качестве значения номер телефона в соответствии с форматом.',
        function() {
            beforeEach(function() {
                phoneField.setValue('+7 (495) 123-45-67'); 
            });

            it('Отображается корректно отформатированный номер.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
            });
        });

        testInsertingValue('Вставляю', 'paste');

        describe('Ввожу номер телефона частично.', function() {
            var oldValuePassedAsArgument;

            beforeEach(function() {
                oldValuePassedAsArgument = null;

                phoneField.on('change', function(field, newValue, oldValue) {
                    oldValuePassedAsArgument = oldValue;
                });

                formTester.textfield().withFieldLabel('Phone').input('49@$#51#$FS23#456');
            });

            it('Поле отмечено, как невалидное.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveError('Некорректное значение');
            });
            describe('Ввожу последний символ.', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').input('7');
                });

                it('Обработчику события "change" передается старое значение номера.', function() {
                    expect(oldValuePassedAsArgument).toBe(7495123456);
                });
                it('Поле валидно.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveNoError();
                });
                describe('Ввожу лишний символ.', function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').input('4');
                    });

                    it('Поле отмечено, как невалидное.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveError('Некорректное значение');
                    });
                    describe('Ввожу еще один лишний символ.', function() {
                        beforeEach(function() {
                            formTester.textfield().withFieldLabel('Phone').input('0');
                        });

                        it('Поле отмечено, как невалидное.', function() {
                            formTester.textfield().withFieldLabel('Phone').expectToHaveError('Некорректное значение');
                        });
                        describe('Нажимаю на "Backspace".', function() {
                            beforeEach(function() {
                                formTester.textfield().withFieldLabel('Phone').pressBackspace();
                            });

                            it('Поле отмечено, как невалидное.', function() {
                                formTester.textfield().withFieldLabel('Phone').
                                    expectToHaveError('Некорректное значение');
                            });
                            describe('Нажимаю на "Backspace".', function() {
                                beforeEach(function() {
                                    formTester.textfield().withFieldLabel('Phone').pressBackspace();
                                });

                                it('Поле валидно', function() {
                                    formTester.textfield().withFieldLabel('Phone').expectToHaveNoError();
                                });
                                it('Нажимаю на "Backspace". Поле отмечено, как невалидное.', function() {
                                    formTester.textfield().withFieldLabel('Phone').pressBackspace();

                                    formTester.textfield().withFieldLabel('Phone').
                                        expectToHaveError('Некорректное значение');
                                });
                            });
                        });
                    });
                    describe('Нажимаю на "Backspace".', function() {
                        beforeEach(function() {
                            formTester.textfield().withFieldLabel('Phone').pressBackspace();
                        });

                        it('Поле валидно.', function() {
                            formTester.textfield().withFieldLabel('Phone').expectToHaveNoError();
                        });
                        it('Нажимаю на "Backspace". Поле отмечено, как невалидное.', function() {
                            formTester.textfield().withFieldLabel('Phone').pressBackspace();

                            formTester.textfield().withFieldLabel('Phone').expectToHaveError('Некорректное значение');
                        });
                    });
                });
            });
        });

        testInsertingValue('Ввожу', 'input');

        describe('Ввожу одну цифру. Дважды нажимаю на "Backspace".', function() {
            beforeEach(function() {
                formTester.textfield().withFieldLabel('Phone'). input('4');
                formTester.textfield().withFieldLabel('Phone').pressBackspace();
                formTester.textfield().withFieldLabel('Phone').pressBackspace();
            });

            it('Поле является пустым.', function() {
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (___) ___-__-__');
            });
            it('Еще раз нажимаю на "Backspace". Поле остается пустым.', function() {
                formTester.textfield().withFieldLabel('Phone').pressBackspace();
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (___) ___-__-__');
            });
        });
        describe('Вставляю слишком много цифр со случайными символами. Помещаю курсор за предел маски.', function() {
            beforeEach(function() {
                formTester.textfield().withFieldLabel('Phone').paste('#f@$*9495#*($)123456#(*%^^)7#**(k32&#43**##*5)');
                formTester.textfield().withFieldLabel('Phone').putCursorAt(20);
            });
            
            describe('Нажимаю на кнопку "Backspace".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').pressBackspace();
                });

                it('Цифра расположенная спереди курсора удалена.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-5672435');
                });
                it('Курсор сдвинулся назад.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(19);
                });
            });
            describe('Нижмаю на кнопку "Delete".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').pressDelete();
                });

                it('Цифры корректно заменены.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (949) 512-34-5673435');
                });
                it('Курсор остался на прежнем месте.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(20);
                });
            });
        });
        describe('Вставляю десять цифр.', function() {
            beforeEach(function() {
                formTester.textfield().withFieldLabel('Phone').paste('4951234567');
            });

            describe('Выделяю часть номера: "495) 12".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').select(4, 11);
                });
                
                describe('Нажимаю на кнопку "Delete".', function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').pressDelete();
                    });

                    it('Номер был отформатирован после удаления цифр.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (345) 67_-__-__');
                    });
                    it((
                        'Курсор расположен перед первым удаленным символом.'
                    ), function() {
                        formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(4);
                    });
                });
                describe('Нажимаю на кнопку "Backspace".', function() {
                    beforeEach(function() {
                        formTester.textfield().withFieldLabel('Phone').pressBackspace();
                    });

                    it('Номер был отформатирован после удаления цифр.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (345) 67_-__-__');
                    });
                    it('Курсор расположен перед первым удаленным символом.', function() {
                        formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(4);
                    });
                });
            });
            describe('Помещаю курсор перед символом маски. Нажимаю на кнопку "Delete".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(12); 
                    formTester.textfield().withFieldLabel('Phone').pressDelete();
                });

                it('Удален ближайший символ спереди.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-56-7_');
                });
                it('Курсор остался на прежнем месте.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(12);
                });
            });
            describe('Помещаю курсор перед цифрой. Нажимаю на кнопку "Delete".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(13);
                    formTester.textfield().withFieldLabel('Phone').pressDelete();
                });

                it('Удален ближайший символ спереди.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-56-7_');
                });
                it('Курсор расположен перед первым неудаленным символом.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(13);
                });
            });
            describe('Помещаю курсор после символа маски. Нажимаю на кнопку "Backspace".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(13);
                    formTester.textfield().withFieldLabel('Phone').pressBackspace();
                });

                it('Удален ближайший символ сзади.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 124-56-7_');
                });
                it('Курсор расположен перед первым неудаленным символом.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(11);
                });
            });
            describe('Помещаю курсор после цифры. Нажимаю на кнопку "Backspace".', function() {
                beforeEach(function() {
                    formTester.textfield().withFieldLabel('Phone').putCursorAt(12);
                    formTester.textfield().withFieldLabel('Phone').pressBackspace();
                });

                it('Удален ближайший символ сзади.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 124-56-7_');
                });
                it('Курсор расположен перед первым неудаленным символом.', function() {
                    formTester.textfield().withFieldLabel('Phone').expectCursorToBeAt(11);
                });
            });
            it(
                'Помещаю курсор в начало поля. Нажмаю на кнопку "Delete". Цифра удалена. Номер отформатирован.',
            function() {
                formTester.textfield().withFieldLabel('Phone').putCursorAtBegining();
                formTester.textfield().withFieldLabel('Phone').pressDelete();
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (951) 234-56-7_');
            });
            it(
                'Помещаю курсор в конец поля. Нажмаю на кнопку "Backspace". Цифра удалена. Номер отформатирован.',
            function() {
                formTester.textfield().withFieldLabel('Phone').putCursorAtEnd();
                formTester.textfield().withFieldLabel('Phone').pressBackspace();
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-6_');
            });
            it([
                'Помещаю курсор перед последней цифрой. Нажмаю на кнопку "Delete". Цифра удалена. Номер ',
                'отформатирован.'
            ].join(''), function() {
                formTester.textfield().withFieldLabel('Phone').putCursorAt(17);
                formTester.textfield().withFieldLabel('Phone').pressDelete();
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-6_');
            });
            it(
                'Помещаю курсор в начало поля. Ввожу цифру. Цифра добавлена. Номер отформатирован.',
            function() {
                formTester.textfield().withFieldLabel('Phone').putCursorAtBegining();
                formTester.textfield().withFieldLabel('Phone').input('0');
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (049) 512-34-567');
            });
            it(
                'Помещаю курсор в начало поля. Нажмаю на кнопку "Backspace". Ничего не происходит.',
            function() {
                formTester.textfield().withFieldLabel('Phone').putCursorAtBegining();
                formTester.textfield().withFieldLabel('Phone').pressBackspace();
                formTester.textfield().withFieldLabel('Phone').expectToHaveValue('+7 (495) 123-45-67');
            });
        });
    });
});
