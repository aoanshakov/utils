tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe(
        'Есть два класса. Один из классов унаследован от другого. В классах определены защищиенные члены.',
    function() {
        var object1,
            object2,
            object3;

        Ext.define('Comagic.test.privateMembers.Class1', {
            constructor: function (config) {
                this.protected.value = config.value;
            },
            getValueInParentheses: function () {
                return '(' + this.getValue() + ')';
            },
            getValue: function () {
                return '"' + this.protected.value + '"';
            },
            setValue: function (value) {
                this.protected.value = this.protected.multiplyByHundred(value) * 10;
            },
            increase: function () {
                this.protected.value ++;
            },
            increaseFourTimes: function () {
                this.protected.increaseTwice();
                this.protected.increaseTwice();
            },
            increaseTwelveTimes: function () {
                this.protected.increaseSixTimes();
                this.protected.increaseSixTimes();
            },
            protected: {
                value: null,
                multiplyByHundred: function (value) {
                    return value * 100;
                },
                increaseSixTimes: function () {
                    this.protected.increaseTwice();
                    this.protected.increaseTwice();
                    this.protected.increaseTwice();
                },
                increaseTwice: function () {
                    this.increase();
                    this.increase();
                }
            }
        });

        Ext.define('Comagic.test.privateMembers.Class2', {
            extend: 'Comagic.test.privateMembers.Class1',
            constructor: function (config) {
                this.protected.someNumber = config.someNumber;
                this.callParent(arguments);
            },
            setValue: function (value) {
                this.callParent([this.protected.multiplyBySomeNumber(value)]);
            },
            protected: {
                someNumber: 0,
                multiplyBySomeNumber: function (value) {
                    return value * this.protected.someNumber;
                }
            }
        });

        describe('Создаю экземпляры классов.', function() {
            beforeEach(function() {
                object1 = Ext.create('Comagic.test.privateMembers.Class1', {
                    value: 1
                });
                object2 = Ext.create('Comagic.test.privateMembers.Class1', {
                    value: 2
                });
                object3 = Ext.create('Comagic.test.privateMembers.Class2', {
                    value: 3,
                    someNumber: 5
                });
            });

            it('Конструктор имеет доступ к защищиенным членам.', function() {
                expect(object1.getValue()).toBe('"1"');
                expect(object2.getValue()).toBe('"2"');
                expect(object3.getValue()).toBe('"3"');
            });
            it('Защищенные члены недоступны извне.', function() {
                expect(object1.protected).toBe(null);
                expect(object1.protected).toBe(null);
                expect(object3.protected).toBe(null);
            });
            describe('Вызываю публичные методы объектов.', function() {
                beforeEach(function() {
                    object1.setValue(4);
                    object2.setValue(5);
                    object3.setValue(6);
                });

                it('Публичные методы, вызванные в публичных методах имеют доступн к защищиенным членам.', function() {
                    expect(object1.getValueInParentheses()).toBe('("4000")');
                    expect(object2.getValueInParentheses()).toBe('("5000")');
                    expect(object3.getValueInParentheses()).toBe('("30000")');
                });
                it('Публичные методы имеют доступ к защищиенным членам.', function() {
                    expect(object1.getValue()).toBe('"4000"');
                    expect(object2.getValue()).toBe('"5000"');
                    expect(object3.getValue()).toBe('"30000"');

                    object1.increase();
                    object1.increase();
                    object2.increase();
                    object3.increase();

                    expect(object1.getValue()).toBe('"4002"');
                    expect(object2.getValue()).toBe('"5001"');
                    expect(object3.getValue()).toBe('"30001"');
                });
                it('Защищенные методы имеют доступ к публичным членам.', function() {
                    object1.increaseFourTimes();
                    object1.increaseFourTimes();
                    object2.increaseFourTimes();
                    object3.increaseFourTimes();

                    expect(object1.getValue()).toBe('"4008"');
                    expect(object2.getValue()).toBe('"5004"');
                    expect(object3.getValue()).toBe('"30004"');
                });
                it('Защищенные методы имеют доступ к защищенным методам.', function() {
                    object1.increaseTwelveTimes();
                    object1.increaseTwelveTimes();
                    object2.increaseTwelveTimes();
                    object3.increaseTwelveTimes();

                    expect(object1.getValue()).toBe('"4024"');
                    expect(object2.getValue()).toBe('"5012"');
                    expect(object3.getValue()).toBe('"30012"');
                });
            });
        });
    });
});
