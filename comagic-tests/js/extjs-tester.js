function ExtJsTester_Factory () {
    var fakeNow = new ExtJsTester_Now(),
        nowFaker = new ExtJsTester_NowFaker(fakeNow);

    this.createDebugger = function () {
        return new ExtJsTester_Debugger();
    };
    this.createUtils = function (debug) {
        return new ExtJsTester_Utils(debug);
    };
    this.createDomElementTester = function (
        domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription
    ) {
        return new ExtJsTester_DomElement(domElement, wait, utils, testersFactory, gender, nominativeDescription,
            accusativeDescription, genetiveDescription);
    };
    this.admixDomElementTester = function (me, args) {
        ExtJsTester_DomElement.apply(me, args);
    };
    this.createTestersFactory = function (wait, utils) {
        return new ExtJsTester_TestersFactory(wait, utils, this);
    };
    this.createTestArguments = function () {
        return {
            fakeNow: fakeNow
        };
    };
    this.beforeEach = function () {
        nowFaker.replaceByFake();
    };
    this.afterEach = function () {
        nowFaker.restoreReal();
    };
    this.createGender = function () {
        var gender = (new JsTester_Factory()).createGender();
        
        gender.female.disabled = 'заблокированной';
        gender.female.enabled = 'доступной';
        gender.female.masked = 'маскированной';
        gender.female.checked = 'отмечена';
        gender.female.selected = 'выделенной';

        gender.male.disabled = 'заблокированным';
        gender.male.enabled = 'доступным';
        gender.male.masked = 'маскированным';
        gender.male.checked = 'отмечен';
        gender.male.selected = 'выделенным';

        gender.neuter.disabled = 'заблокированным';
        gender.neuter.enabled = 'доступным';
        gender.neuter.masked = 'маскированным';
        gender.neuter.checked = 'отмечено';
        gender.neuter.selected = 'выделенным';

        return gender;
    };
}

function ExtJsTester_Now () {
    var value = Date.now();

    this.set = function (formattedDate) {
        var format = 'Y-m-d H:i:s';

        if (formattedDate.length == 10) {
            format = 'Y-m-d';
        }

        value = Ext.Date.parse(formattedDate, format).getTime();
    };
    this.get = function () {
        return value;
    };
}

function ExtJsTester_NowFaker (fakeNow) {
    var now = Ext.Date.now;

    this.replaceByFake = function () {
        Ext.Date.now = function () {
            return fakeNow.get();
        };
    };
    this.restoreReal = function () {
        Ext.Date.now = now;
    };
}

function ExtJsTester_TestersFactory (wait, utils, factory) {
    var gender = factory.createGender(),
        female = gender.female,
        neuter = gender.neuter,
        male = gender.male;
    
    JsTester_TestersFactory.apply(this, arguments);

    this.searchColumn = function (getGrid, desiredHeaderText) {
        return new ExtJsTester_ColumnSearchResult (getGrid, desiredHeaderText, utils);
    };
    this.createAlertWindowTester = function () {
        return new ExtJsTester_AlertWindow(utils.getFloatingComponent(), wait, utils, this, neuter, 'всплывающее окно',
            'всплывающее окно', 'всплывающего окна', factory);
    };
    this.createErrorIconTester = function (getDomElement) {
        return new ExtJsTester_DomElement(getDomElement, wait, utils, this, female, 'иконка ошибки', 'иконку ошибки',
            'иконки ошибки');
    };
    this.createMenuItemTester = function (domElement, text) {
        return new ExtJsTester_DomElement(domElement, wait, utils, this, male, 'пункт меню "' + text + '"',
            'пункт меню "' + text + '"', 'пункта меню "' + text + '"');
    };
    this.createCellGetter = function (grid, row, nominativeRowDescription, prepositionalRowDescription) {
        return new ExtJsTester_CellGetter(grid, row, utils, this, nominativeRowDescription,
            prepositionalRowDescription);
    };
    this.createCheckboxInColumnTester = function (cell, cellDescription) {
        return new ExtJsTester_DomElement(Ext.fly(cell).down(
            '.x-grid-row-checker', true
        ), wait, utils, this, male, 'чекбокс в колонке ' + cellDescription, 'чекбокс в колонке ' + cellDescription,
            'чекбокса в колонке ' + cellDescription);
    };
    this.createCellTester = function (row, prepositionalRowDescription,  columnIndex, columnDescription) {
        return new ExtJsTester_Cell(
            row, wait, utils, this, female, prepositionalRowDescription,  columnIndex, columnDescription, factory);
    };
    this.createComboBoxOptionTester = function (pickerList, text) {
        return new ExtJsTester_DomElement(utils.findElementByTextContent(pickerList, text, '.x-boundlist-item'), wait,
            utils, this, female, 'опция "' + text + '"', 'опцию "' + text + '"', 'опции "' + text + '"');
    };
    this.createComboBoxTester = function (field, label) {
        return new ExtJsTester_ComboBox((
            field && field.inputEl ? field.inputEl.dom : null
        ), field && field.el ? field.el.dom : null, wait, utils, this, male,
            utils.fieldDescription('выпадающий список', label),
            utils.fieldDescription('выпадающий список', label), utils.fieldDescription('выпадающего списка', label),
            utils.fieldDescription('в выпадающем списке', label), field, factory);
    };
    this.createCheckboxTester = function (field, label) {
        return new ExtJsTester_Checkable((
            field && field.inputEl ? field.inputEl.dom : null
        ), field && field.el ? field.el.dom : null, wait, utils, this, male, utils.fieldDescription('чекбокс', label),
            utils.fieldDescription('чекбокс', label), utils.fieldDescription('чекбокса', label), factory);
    };
    this.createRadioFieldTester = function (field, label) {
        return new ExtJsTester_Checkable((
            field && field.inputEl ? field.inputEl.dom : null
        ), field && field.el ? field.el.dom : null, wait, utils, this, female,
            utils.fieldDescription('радиокнопка', label), utils.fieldDescription('радиокнопку', label),
            utils.fieldDescription('радиокнопки', label));
    };
    this.createButtonTester = function (button) {
        return new ExtJsTester_ButtonTester(button, wait, utils, this, female, 'кнопка', 'кнопку', 'кнопки', factory);
    };
    this.createFormTester = function (form) {
        return new ExtJsTester_FormTester(form, wait, utils, this, female, 'форма', 'форму', 'формы', factory);
    };
    this.createGridRow = function (grid, row, nominativeRowDescription, prepositionalRowDescription) {
        return new ExtJsTester_GridRow(grid, row, this, nominativeRowDescription, prepositionalRowDescription, female);
    };
    this.createGridRowGetter = function (getGrid) {
        return new ExtJsTester_GridRowGetter(getGrid, utils, this);
    };
    this.createColumnGetter = function (getGrid) {
        return new ExtJsTester_ColumnGetter(getGrid, utils, this);
    };
    this.createColumnTester = function (columnHeader, desiredHeaderText) {
        return new ExtJsTester_DomElement(columnHeader, wait, utils, this, female, 'колонка с заголовком "' +
            desiredHeaderText + '"', 'колонку с заголовком "' + desiredHeaderText + '"', 'колонки с заголовком "' +
            desiredHeaderText + '"');
    };
    this.createGridTester = function (grid) {
        return new ExtJsTester_GridTester(grid, wait, utils, this, female, 'таблица', 'таблицу', 'таблицы');
    };
    this.createTabTitleTester = function (tabTitle, title) {
        return new ExtJsTester_DomElement((
            tabTitle && tabTitle.el ? tabTitle.el.dom : null
        ), wait, utils, this, female, 'вкладка "' + title + '"', 'вкладку "' + title + '"', 'вкладки "' + title + '"');
    };
    this.createTabPanelTester = function (tabPanel) {
        return new ExtJsTester_TabPanelTester(tabPanel, this);
    };
    this.createComponentTester = function () {
        var getComponentElement, getComponent;

        if (typeof arguments[0] == 'function') {
            getComponent = arguments[0];

            getComponentElement = function () {
                var component = getComponent();
                return component && component.el ? component.el.dom : null;
            };
        } else {
            var component = arguments[0];

            getComponent = function () {
                return component;
            };

            getComponentElement = function () {
                return component && component.el ? component.el.dom : null;
            };
        }

        return new ExtJsTester_DomElement(getComponentElement, wait, utils, this, male, function () {
            return 'компонент ' + utils.getComponentDescription(getComponent());
        }, function () {
            return 'компонент ' + utils.getComponentDescription(getComponent());
        }, function () {
            return 'компонента ' + utils.getComponentDescription(getComponent());
        });
    };
}

function ExtJsTester_TooltipTextEqualityCondition (expectedTooltipText) {
    this.getDescription = function () {
        return 'с текстом "' + expectedTooltipText + '"';
    };
    this.isDesiredTooltip = function (tooltipText) {
        return tooltipText == expectedTooltipText;
    };
}

function ExtJsTester_TooltipTextContainingCondition (expectedTooltipSubstring) {
    this.getDescription = function () {
        return 'включающая текст "' + expectedTooltipSubstring + '"';
    };
    this.isDesiredTooltip = function (tooltipText) {
        return tooltipText.indexOf(expectedTooltipSubstring) != -1;
    };
}

function ExtJsTester_DomElement (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription
) {
    var getDomElement = utils.makeFunction(domElement),
        getNominativeDescription = utils.makeFunction(nominativeDescription),
        getAccusativeDescription = utils.makeFunction(accusativeDescription),
        getGenetiveDescription = utils.makeFunction(genetiveDescription);

    JsTester_DomElement.apply(this, arguments);

    this.expectToBeMasked = function () {
        this.expectToBeVisible();

        if (!Ext.fly(getDomElement()).hasCls('x-masked')) {
            throw new Error(
                Ext.util.Format.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' +
                gender.masked + '.'
            );
        }
    };
    this.expectNotToBeMasked = function () {
        this.expectToBeVisible();

        if (Ext.fly(getDomElement()).hasCls('x-masked')) {
            throw new Error(
                Ext.util.Format.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' быть ' +
                gender.masked + '.'
            );
        }
    };
    this.expectToBeDisabled = function () {
        this.expectToBeVisible();

        if (!Ext.fly(getDomElement()).hasCls('x-item-disabled')) {
            throw new Error(
                Ext.util.Format.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' +
                gender.disabled + '.'
            );
        }
    };
    this.expectToBeEnabled = function () {
        this.expectToBeVisible();

        if (Ext.fly(getDomElement()).hasCls('x-item-disabled')) {
            throw new Error(
                Ext.util.Format.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' +
                gender.enabled + '.'
            );
        }
    };
    this.expectNoTooltipToBeShownOnMouseOver = function () {
        this.expectToBeVisible();

        var tooltipsTraverser = new ExtJsTester_TooltipsTraverser(utils),
            tooltipsTraverseResult;

        tooltipsTraverseResult = tooltipsTraverser.traverse();

        if (tooltipsTraverseResult.isThereAnyVisibleTooltip()) {
            throw new Error('Ни одна подсказка не должна быть видимой до того, как на ' + getAccusativeDescription() +
                ' будет наведен курсор мыши, тем не менее ' + (
                    tooltipsTraverseResult.areThereSeveralVisibleTooltips() ?
                    (
                        'видимыми являются следующие подсказки: ' +
                        tooltipsTraverseResult.getVisibleTooltipsTexts()
                    ) : (
                        'подсказка с текстом ' +
                        tooltipsTraverseResult.getVisibleTooltipsTexts() +
                        ' является видимой'
                    )
                ) + '.');
        }

        utils.dispatchMouseEvent(getDomElement(), 'mouseover');
        wait();

        tooltipsTraverseResult = tooltipsTraverser.traverse();

        if (tooltipsTraverseResult.isThereAnyVisibleTooltip()) {
            throw new Error('Ни одна подсказка не должна быть видимой при наведении курсора мыши на ' +
                getAccusativeDescription() + ', тем не менее ' + (
                    tooltipsTraverseResult.areThereSeveralVisibleTooltips() ?
                    (
                        'видимыми являются следующие подсказки: ' +
                        tooltipsTraverseResult.getVisibleTooltipsTexts()
                    ) : (
                        'подсказка с текстом ' +
                        tooltipsTraverseResult.getVisibleTooltipsTexts() +
                        ' является видимой'
                    )
                ) + '.');
        }
    };
    this.expectTooltipWithText = function (expectedTooltipText) {
        this.expectToBeVisible();
        return new ExtJsTester_TooltipExpectation(new ExtJsTester_TooltipTextEqualityCondition(expectedTooltipText),
            getDomElement(), getAccusativeDescription, wait, utils);
    };
    this.expectTooltipContainingText = function (expectedTooltipSubstring) {
        this.expectToBeVisible();
        return new ExtJsTester_TooltipExpectation(
            new ExtJsTester_TooltipTextContainingCondition(expectedTooltipSubstring), getDomElement(),
            getAccusativeDescription, wait, utils);
    };
    this.findComponentByElementSelector = function (selector, createTester) {
        if (!createTester) {
            createTester = function (component) {
                testersFactory.createComponentTester(component);
            };
        }
        
        return createTester(Ext.ComponentManager.get(getDomElement().querySelector(selector).id));
    };
    this.findComponentByElementTextContent = function (desiredTextContent, selector, createTester) {
        if (!createTester) {
            createTester = function (component) {
                testersFactory.createComponentTester(component);
            };
        }

        return createTester(Ext.ComponentManager.get(
            utils.findElementByTextContent(getDomElement(), desiredTextContent, selector).id
        ));
    };
}

function ExtJsTester_TooltipsTraverseResult (
    allTooltipsTexts, visibleTooltipsTexts
) {
    function getArrayOfStringsPresentation (arrayOfStrings) {
        return '"' + arrayOfStrings.join('", "') + '"';
    }

    this.isThereAnyVisibleTooltip = function () {
        return visibleTooltipsTexts.length > 0;
    };
    this.areThereSeveralVisibleTooltips = function () {
        return visibleTooltipsTexts.length > 1;
    };
    this.isThereAnyTooltip = function () {
        return allTooltipsTexts.length > 0;
    };
    this.getVisibleTooltipsTexts = function () {
        return getArrayOfStringsPresentation(visibleTooltipsTexts);
    };
    this.getAllTooltipsTexts = function () {
        return getArrayOfStringsPresentation(allTooltipsTexts);
    };
}

function ExtJsTester_TooltipsTraverser (utils) {
    var iterationHandlers = [];

    this.addIterationHandler = function (iterationHandler) {
        iterationHandlers.push(iterationHandler);
    };
    this.traverse = function () {
        var allTooltipsTexts = [], visibleTooltipsTexts = [];

        Ext.getBody().query('.x-tip', false).forEach(function (tooltip) {
            var tooltipText = utils.getTextContent(tooltip.down('.x-autocontainer-innerCt').dom);

            var isVisible = tooltip.isVisible();

            if (isVisible) {
                visibleTooltipsTexts.push(tooltipText);
            }

            iterationHandlers.forEach(function (handleIteration) {
                handleIteration(tooltipText, isVisible);
            });

            allTooltipsTexts.push(tooltipText);
        });

        return new ExtJsTester_TooltipsTraverseResult(allTooltipsTexts,
            visibleTooltipsTexts);
    };
}

function ExtJsTester_TooltipFinder (tooltipFindingCondition) {
    var isTooltipFound = false,
        isFoundTooltipVisible = false;

    this.handleIteration = function (tooltipText, isVisible) {
        if (tooltipFindingCondition.isDesiredTooltip(tooltipText)) {
            isTooltipFound = true;

            if (isVisible) {
                isFoundTooltipVisible = true;
            }
        }
    };
    this.isTooltipFound = function () {
        return isTooltipFound;
    };
    this.isFoundTooltipVisible = function () {
        return isFoundTooltipVisible;
    };
}

function ExtJsTester_TooltipExpectation (
    tooltipFindingCondition, targetDomElement, getAccusativeDescription, wait, utils
) {
    var tooltipsTraverseResult,
        tooltipFinder;

    function putMouseOverTargerElementAndFindTooltip () {
        var tooltipsTraverser = new ExtJsTester_TooltipsTraverser(utils);

        tooltipsTraverseResult = tooltipsTraverser.traverse();
        tooltipFinder = new ExtJsTester_TooltipFinder(tooltipFindingCondition);
        
        if (tooltipsTraverseResult.isThereAnyVisibleTooltip()) {
            throw new Error(
                'Ни одна подсказка не должна быть видимой до того, как на ' + getAccusativeDescription() + ' будет ' +
                'наведен курсор мыши, тем не менее ' + (
                    tooltipsTraverseResult.areThereSeveralVisibleTooltips() ?  (
                        'видимыми являются следующие подсказки: ' + tooltipsTraverseResult.getVisibleTooltipsTexts()
                    ) : (
                        'подсказка с текстом ' + tooltipsTraverseResult.getVisibleTooltipsTexts() + ' является видимой'
                    )
                ) + '.'
            );
        }

        utils.dispatchMouseEvent(targetDomElement, 'mouseover');
        wait();

        tooltipsTraverser.addIterationHandler(tooltipFinder.handleIteration);
        tooltipsTraverseResult = tooltipsTraverser.traverse();
    }

    this.toBeShownOnMouseOver = function () {
        putMouseOverTargerElementAndFindTooltip();

        if (tooltipsTraverseResult.areThereSeveralVisibleTooltips()) {
            throw new Error(
                'При наведении курсора мыши на ' + getAccusativeDescription() + 'были показаны больше одной ' +
                'подсказки, тогда как должна быть отображена только одна. Видимы следующие подсказки: "' +
                tooltipsTraverseResult.getVisibleTooltipsTexts() + '.'
            );
        }

        if (!tooltipsTraverseResult.isThereAnyTooltip()) {
            throw new Error(
                'Не найдена ни одна подсказка, тогда как при наведении курсора мыши на ' + getAccusativeDescription() +
                ' должна быть отображена подсказка ' + tooltipFindingCondition.getDescription() + '.'
            );
        }

        if (!tooltipFinder.isTooltipFound()) {
            throw new Error(
                'При наведении курсора мыши на ' + getAccusativeDescription() + ' не была найдена подсказка ' +
                tooltipFindingCondition.getDescription() + '. Найдены следующие подсказки: ' +
                tooltipsTraverseResult.getAllTooltipsTexts() + '.'
            );
        }

        if (!tooltipFinder.isFoundTooltipVisible()) {
            throw new Error(
                'Подсказка ' + tooltipFindingCondition.getDescription() + 'осталась скрытой, при наведении курсора ' +
                'мыши на ' + getAccusativeDescription() + '. ' + (
                    tooltipsTraverseResult.isThereAnyVisibleTooltip() ? (
                        tooltipsTraverseResult.areThereSeveralVisibleTooltips() ? (
                                'Видимыми являются следующие подсказки: ' +
                                tooltipsTraverseResult.getVisibleTooltipsTexts()
                            ) : (
                                'Подсказка с текстом ' + tooltipsTraverseResult.getVisibleTooltipsTexts() +
                                'является видимой'
                            )
                    ) : 'Все подсказки скрыты'
                ) + '.'
            );
        }
    };
    this.notToBeShownOnMouseOver = function () {
        putMouseOverTargerElementAndFindTooltip();
        
        if (tooltipFinder.isFoundTooltipVisible()) {
            throw new Error(
                'Подсказка ' + tooltipFindingCondition.getDescription() + 'не должна быть показана, при наведении ' +
                'курсора мыши на ' + getAccusativeDescription() + '.'
            );
        }
    };
}

function ExtJsTester_Cell (
    row, wait, utils, testersFactory, gender, prepositionalRowDescription,  columnIndex, columnDescription, factory
) {
    var cell = Ext.fly(row).query('.x-grid-cell-inner')[columnIndex],
        cellDescription = columnDescription + ' в ' + prepositionalRowDescription + ' строке';
    
    ExtJsTester_DomElement.apply(this, [cell, wait, utils, testersFactory, gender, 'колонка ' + cellDescription,
        'колонку ' + cellDescription, 'колонки ' + cellDescription], factory);

    this.checkbox = function () {
        return testersFactory.createCheckboxInColumnTester(cell, cellDescription);
    };
}

function ExtJsTester_ColumnGetter (getGrid, utils, testersFactory) {
    this.withHeader = function (desiredHeaderText) {
        return testersFactory.createColumnTester(function () {
            return testersFactory.searchColumn(getGrid, desiredHeaderText).getHeader();
        }, desiredHeaderText);
    };
}

function  ExtJsTester_ColumnSearchResult (getGrid, desiredHeaderText, utils) {
    var grid = utils.makeFunction(getGrid)(),
        desiredHeader,
        desiredColumnIndex,
        headerTexts = [];

    if (grid) {
        var headers = grid.down('headercontainer').el.query('.x-column-header-text-inner'),
            length = headers.length,
            columnIndex,
            header,
            actualHeaderText,
            nextVisibleColumnIndex = 0,
            currentVisibleColumnIndex;

        for (columnIndex = 0; columnIndex < length; columnIndex ++) {
            header = headers[columnIndex];

            window.logEnabled = window.logWasEnabled ? false : true;
            window.logWasEnabled = true;

            if (!utils.isVisible(header)) {
                window.logEnabled = false;
                continue;
            }
            window.logEnabled = false;

            currentVisibleColumnIndex = nextVisibleColumnIndex;
            nextVisibleColumnIndex ++;
            actualHeaderText = utils.getTextContent(header);
            headerTexts.push(actualHeaderText);

            if (actualHeaderText == desiredHeaderText) {
                desiredColumnIndex = currentVisibleColumnIndex;
                desiredHeader = header;
            }
        }
    }

    this.getHeader = function () {
        return desiredHeader;
    };
    
    this.getIndex = function () {
        return desiredColumnIndex;
    };

    this.isFound = function () {
        return !!grid;
    };

    this.getHeaderTexsts = function () {
        return headerTexts;
    };
}

function ExtJsTester_CellGetter (
    grid, row, utils, testersFactory, nominativeRowDescription, prepositionalRowDescription
) {
    this.first = function () {
        return this.atIndex(0);
    };
    this.atIndex = function (columnIndex) {
        return testersFactory.createCellTester(row, prepositionalRowDescription,  columnIndex,
            'под номером ' + (columnIndex + 1));
    };
    this.withHeader = function (desiredHeaderText) {
        var result = testersFactory.searchColumn(grid, desiredHeaderText);

        if (result.isFound()) {
            return testersFactory.createCellTester(row, prepositionalRowDescription,
                result.getIndex(), 'с заголовком "' + desiredHeaderText + '"');
        }
        
        throw new Error(
            'В ' + prepositionalRowDescription + ' строке таблицы не найдена колонка с заголовком "' +
            desiredHeaderText + '". В таблце присутствуют следующие колонки: "' +
            result.getHeaderTexsts().join('", "') + '"'
        );
    };
}

function ExtJsTester_GridRow (
    grid, row, testersFactory, nominativeRowDescription, prepositionalRowDescription, gender
) {
    this.expectToBeSelected = function () {
        if (!Ext.fly(row).hasCls('x-grid-item-selected')) {
            throw new Error(Ext.util.Format.capitalize(nominativeRowDescription) + ' строка ' + gender.should +
                ' быть ' + gender.selected + '.');
        }
    };
    this.expectNotToBeSelected = function () {
        if (Ext.fly(row).hasCls('x-grid-item-selected')) {
            throw new Error(Ext.util.Format.capitalize(nominativeRowDescription) + ' строка не ' + gender.should +
                ' быть ' + gender.selected + '.');
        }
    };
    this.column = function () {
        return testersFactory.createCellGetter(grid, row, nominativeRowDescription, prepositionalRowDescription);
    };
    this.createTester = function () {
        return testersFactory.createDescendantsTesterFactory(row);
    };
}

function ExtJsTester_GridRowGetter (getGrid, utils, testersFactory) {
    function getRowAtIndex (rowIndex, nominativeRowDescription, prepositionalRowDescription) {
        var grid = getGrid();

        if (!grid) {
            throw new Error('Таблица не найдена.');
        }

        if (!grid.getView) {
            throw new Error('Объект ' + utils.getComponentDescription(grid) + ' не является таблицей.');
        }

        if (!grid.getView().el) {
            throw new Error('Объект ' + utils.getComponentDescription(grid) + ' не отрендерен.');
        }

        var rows = grid.getView().el.query('.x-grid-item'),
            row = rows[rowIndex];

        if (!row) {
            throw new Error('В таблице не найдена ' + nominativeRowDescription + ' строка. В таблице всего ' +
                rows.length + ' строк.');
        }

        return testersFactory.createGridRow(grid, row, nominativeRowDescription, prepositionalRowDescription);
    }

    this.first = function () {
        return getRowAtIndex(0, 'первая', 'первой');
    };
    this.atIndex = function (rowIndex) {
        var rowNumber = rowIndex + 1;
        return getRowAtIndex(rowIndex, rowNumber + '-ая', rowNumber + '-ой');
    };
}

function ExtJsTester_GridTester (
    getGrid, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription, genetiveDescription
) {
    getGrid = utils.makeFunction(getGrid);

    ExtJsTester_DomElement.apply(this, [function () {
        var grid = getGrid();
        return grid && grid.el && grid.el.dom;
    }].concat(Array.prototype.slice.call(arguments, 1)));

    this.row = function () {
        return testersFactory.createGridRowGetter(getGrid);
    };
    this.column = function () {
        return testersFactory.createColumnGetter(getGrid);
    };
    this.expectToHaveRowsCount = function (expectedRowsCount) {
        var actualRowsCount = grid.getView().el.query('.x-grid-item').length;

        if (actualRowsCount != expectedRowsCount) {
            throw new Error('В таблице должно быть ' + expectedRowsCount + ', а не ' + actualRowsCount + '.');
        }
    };
}

function ExtJsTester_FieldsGetter (form, utils, createFieldTester) {
    function searchByPropertyValue (propertyName, propertyValue, createFieldTester, additionalCondition) {
        var i,
            length,
            component;

        additionalCondition = additionalCondition || function () {
            return true;
        };

        if (!form) {
            throw new Error('Форма, в которой осуществляется поиск поля не существует.');
        }

        if (typeof form.query != 'function') {
            throw new Error('Объект ' + utils.getTypeDescription(form) + ' в котором производится поиск поля не ' +
                'является контейнером.');
        }

        var components = form.query('component'),
            found = [],
            visible = [];

        length = components.length;

        for (i = 0; i < length; i ++) {
            component = components[i];

            if (utils.getTextContent(component[propertyName] + '') == propertyValue && additionalCondition(component)) {
                found.push(component);

                if (component && component.el && component.el.dom && utils.isVisible(component.el.dom)) {
                    visible.push(component);
                }
            }
        }

        if (found.length != 1 && visible.length == 1) {
            found = visible;
        }

        if (!found.length) {
            return createFieldTester(null, propertyValue);
        }

        if (found.length != 1) {
            throw new Error('Внутри объекта ' + utils.getTypeDescription(form) + ' найдено больше одного объекта, у ' +
                'которого свойство "' + propertyName + '" имеет значение "' + propertyValue + '".');
        }

        return createFieldTester(found[0], propertyValue);
    }
    
    this.withValue = function (value) {
        return searchByPropertyValue('rawValue', value, function (component) {
            return createFieldTester(component);
        });
    };
    this.withPlaceholder = function (placeholder) {
        return searchByPropertyValue('emptyText', placeholder, createFieldTester, function (component) {
            return !component.getRawValue();
        });
    };
    this.withBoxLabel = function (boxLabel) {
        return searchByPropertyValue('boxLabel', boxLabel, createFieldTester);
    };
    this.withFieldLabel = function (fieldLabel) {
        return searchByPropertyValue('fieldLabel', fieldLabel, createFieldTester);
    };
}

function ExtJsTester_ComboBox (
    inputElement, componentElement, wait, utils, testersFactory, gender, nominativeDescription,
    accusativeDescription, genetiveDescription, prepositionalDescription, comboBoxComponent, factory
) {
    JsTester_InputElement.apply(this, [
        inputElement, componentElement, wait, utils, testersFactory, gender, nominativeDescription,
        accusativeDescription, genetiveDescription, factory
    ]);

    this.clickArrow = function () {
        var i = 2, el;

        this.expectToBeVisible();

        while((el = Ext.fly(componentElement).down(
            '.x-form-item-body > .x-form-trigger-wrap > .x-form-trigger:nth-child(' + i + ')'
        ))) {
            if (el.hasCls('x-form-arrow-trigger')) {
                utils.dispatchMouseEvent(el.dom, 'click');
                return this;
            }
        }

        throw new Error('Триггер со стрелкой не найден ' + prepositionalDescription);
    };
    this.option = function (text) {
        return testersFactory.createComboBoxOptionTester(comboBoxComponent.getPicker(), text);
    };
    this.options = function () {
        return testersFactory.createDomElementTester(
            utils.getVisibleSilently(document.querySelectorAll('.x-boundlist'))
        );
    };
}

function ExtJsTester_Checkable (
    inputElement, componentElement, wait, utils, testersFactory, gender, nominativeDescription,
    accusativeDescription, genetiveDescription, factory
) {
    ExtJsTester_DomElement.apply(this, [inputElement].concat(Array.prototype.slice.call(arguments, 2)));

    var componentElementTester = new ExtJsTester_DomElement(componentElement, wait, utils, testersFactory, gender,
        nominativeDescription, accusativeDescription, genetiveDescription);

    this.expectToBeDisabled = function () {
        componentElementTester.expectToBeDisabled();
    };
    this.expectToBeEnabled = function () {
        componentElementTester.expectToBeEnabled();
    };
    this.expectToBeChecked = function () {
        this.expectToBeVisible();

        if (!Ext.fly(componentElement).hasCls('x-form-cb-checked')) {
            throw new Error(
                Ext.util.Format.capitalize(nominativeDescription) + ' ' + gender.should + ' быть ' +
                gender.checked + '.'
            );
        }
    };
    this.expectNotToBeChecked = function () {
        this.expectToBeVisible();

        if (Ext.fly(componentElement).hasCls('x-form-cb-checked')) {
            throw new Error(
                Ext.util.Format.capitalize(nominativeDescription) + ' не ' + gender.should + ' быть ' +
                gender.checked + '.'
            );
        }
    };
    this.createTester = function () {
        return componentElementTester.createTester();
    };
}

function ExtJsTester_FormTester (
    form, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription, genetiveDescription,
    factory
) {
    var getForm;

    if (typeof form == 'function') {
        getForm = form;
    } else {
        getForm = function () {
            return form;
        };
    }

    ExtJsTester_DomElement.apply(this, [function () {
        var form = getForm();
        return form && form.el ? form.el.dom : null;
    }].concat(Array.prototype.slice.call(arguments, 1)));

    this.combobox = function () {
        return new ExtJsTester_FieldsGetter(getForm(), utils, function (field, label) {
            return testersFactory.createComboBoxTester(field, label);
        });
    };
    this.radiofield = function () {
        return new ExtJsTester_FieldsGetter(getForm(), utils, function (field, label) {
            return testersFactory.createRadioFieldTester(field, label);
        });
    };
    this.checkbox = function () {
        return new ExtJsTester_FieldsGetter(getForm(), utils, function (field, label) {
            return testersFactory.createCheckboxTester(
                field ? field.isXType('checkbox') ? field : field.down ? field.down('checkbox') : null : null,
                label
            );
        });
    };
    this.textfield = function () {
        return new ExtJsTester_FieldsGetter(getForm(), utils, function (field, label) {
            return testersFactory.createTextFieldTester(field, label);
        });
    };
}

function ExtJsTester_TabPanelTester (tabPanel, testersFactory) {
    var getTabPanel;

    if (typeof tabPanel == 'function') {
        getTabPanel = tabPanel;
    } else {
        getTabPanel = function () {
            return tabPanel;
        };
    }

    this.tab = function (title) {
        var tabPanel = getTabPanel();

        if (!tabPanel) {
            throw new Error('Панель вкладок, в которой производится поиск вкладки "' + title + '" не существует.');
        }

        if (!tabPanel.el) {
            throw new Error('Панель вкладок в которой производится поиск вкладки "' + title + '"не отрендерена.');
        }

        var tabTitle = tabPanel.down('tab[text="' + title + '"]');

        return testersFactory.createTabTitleTester(tabTitle, title);
    };
}

function ExtJsTester_MenuItemFinder (menu, testersFactory) {
    this.item = function (text) {
        var menuitem;

        return testersFactory.createMenuItemTester(menu && (
            menuitem = menu.down('menuitem[text="' + text + '"]')
        ) && menuitem.el ? menuitem.el.dom : null, text);
    };
}

function ExtJsTester_ButtonTester (
    button, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    var getButton;

    if (typeof button == 'function') {
        getButton = button;
    } else {
        getButton = function () {
            return button;
        };
    }

    function getDomElement () {
        var button = getButton();
        return button && button.el ? button.el.dom : null;
    }

    ExtJsTester_DomElement.apply(this, [getDomElement].concat(Array.prototype.slice.call(arguments, 1)));

    this.menu = function () {
        this.click();
        return new ExtJsTester_MenuItemFinder(utils.getFloatingComponent(), testersFactory);
    };
}

function ExtJsTester_AlertWindow (win, wait, utils, factory) {
    ExtJsTester_DomElement.apply(this, [function () {
        return win && win.el ? win.el.dom : null;
    }].concat(Array.prototype.slice.call(arguments, 1)));

    this.expectToHaveText = function (expectedText) {
        this.expectToBeVisible();

        var windowText = win.el.down('.x-window-text');

        if (!windowText) {
            throw new Error(
                'В данный момент окно должно быть открыто окно с сообщением "' + expectedText + '", однако открыто ' +
                'окно ' + utils.getComponentDescription(win) + '.'
            );
        }

        var actualText = windowText.dom.innerHTML;

        if (expectedText != actualText) {
            throw new Error(
                'Всплывающее окно должно содержать текст "' + expectedText + '", а не "' + actualText + '".'
            );
        }
    };
    this.clickOk = function () {
        this.expectToBeVisible();

        var okButton = win.down('button[text="Ок"]');

        if (!okButton) {
            okButton = win.down('button[text="OK"]');
        }

        if (!okButton) {
            throw new Error(
                'В данный момент окно должно быть открыто окно с сообщением, однако открыто окно ' +
                utils.getComponentDescription(win) + '.'
            );
        }

        utils.dispatchMouseEvent(okButton.el.dom, 'click');
    };
}

function ExtJsTester_Utils (debug) {
    JsTester_Utils.apply(this, arguments);

    var getTypeDescription = this.getTypeDescription,
        findElementByTextContent = this.findElementByTextContent,
        findElementsByTextContent = this.findElementsByTextContent,
        isVisible = this.isVisible;

    this.isVisible = function (domElement) {
        if (domElement instanceof Ext.Component) {
            if (!domElement.el || !domElement.el.dom) {
                return false;
            }

            domElement = domElement.el.dom;
        }

        return isVisible.call(this, domElement);
    };
    this.getComponentByDomElement = function (domElement) {
        return domElement ? Ext.ComponentManager.get(domElement.id) : null;
    };
    this.getTypeDescription = function (value) {
        if (value && value.$className) {
            return value.$className;
        }

        return getTypeDescription.apply(this, [value]);
    };
    this.getComponentDescription = function (component) {
        return '"' + (
            component ? (
                component.title || component.fieldLabel || component.name || this.getTypeDescription(component)
            ) : 'Ext.Component'
        ) + '"';
    };
    this.getFloatingComponent = function () {
        return Ext.WindowManager.zIndexStack.last();
    };
    function getAscendantElementForFindingElementByText (ascendantElement, desiredTextContent) {
        if (ascendantElement instanceof Ext.Component) {
            if (!ascendantElement.el) {
                throw new Error('Компонент, в котором производится поиск элемента с текстом "' + desiredTextContent +
                    '" не отрендерен.');
            }

            ascendantElement = ascendantElement.el.dom;
        }

        return ascendantElement;
    }
    this.findElementByTextContent = function (ascendantElement, desiredTextContent, selector) {
        return findElementByTextContent.apply(this, [getAscendantElementForFindingElementByText(ascendantElement,
            desiredTextContent), desiredTextContent, selector]);
    };
    this.findElementsByTextContent = function (ascendantElement, desiredTextContent, selector) {
        return findElementsByTextContent.apply(this, [getAscendantElementForFindingElementByText(ascendantElement,
            desiredTextContent), desiredTextContent, selector]);
    };
    this.expectExtErrorToOccur = function (expectedMessage, callback) {
        var handle = Ext.Error.handle,
            errorMessage;

        Ext.Error.handle = function (e) {
            errorMessage = e.msg;
            return true;
        };

        callback();
        Ext.Error.handle = handle;

        if (!errorMessage) {
            console.log('Ошибка должна была произойти.');
        }

        if (errorMessage != expectedMessage) {
            throw new Error('Должна была произойти ошибка "' + expectedMessage + '", однако произошла ошибка "' +
                errorMessage + '".');
        }
    };
}

function ExtJsTester_Debugger () {
    var cont = {
        object: function (o) {
            var res;

            if (o === null) {
                return o;
            }
            if (typeof o == 'object'){
                if (o.isMixedCollection) {
                    return o.items;
                } else if (o.isStore) {
                    res = o.data.items;
                    res.$className = o.$className;
                    res.isStore = true;

                    return res;
                } else if (o.isModel) {
                    res = o.data || {};
                    res.$className = o.$className;
                    res.isModel = true;

                    return res;
                } else if (o.isFormField) {
                    o = Ext.apply({
                        value: o.getValue(),
                        minValue: o.minValue,
                        maxValue: o.maxValue
                    }, o);

                    try {
                        o.valid = o.isValid();
                    } catch (e) {}

                    return o;
                } else if (o.isXType && o.isXType('form')) {
                    try {
                        o = Ext.apply({
                            valid: (
                                typeof o.isValid == 'function' ?
                                o.isValid() : o.isValid
                            )
                        }, o);
                    } catch(e) {}

                    return o;
                } else if (o instanceof Date) {
                    return '[Date: '+Ext.Date.format(o, 'Y-m-d H:i:s')+']';
                }
            }

            return o;
        },
        head: function (o, val) {
            var add = '',
                xtype;

            if (o.getXType) {
                xtype = o.getXType();
            }
            if (!xtype && o.xtype) {
                xtype = o.xtype;
            }

            if (xtype) {
                add += xtype;
            }
            if (o.itemId) {
                add += '#'+o.itemId;
            }

            if (add) {
                val += ' "'+add+'" ';
            }

            return val;
        },
        skip: function (o, k) {
            if (typeof o[k] == 'function') {
                return true;
            }
            if (Array.isArray(o)) {
                return isNaN(k);
            }
            if (o.isColumn && k == 'items') {
                return true;
            }
            if (o.isModel) {
                return k == '$className' || k == 'isModel';
            }
            return (
                k != 'id' &&
                k != 'items' &&
                k != 'columns' &&
                k != 'weight' &&
                k != 'dockedItems' &&
                k != 'menu' &&
                k != 'dataIndex' &&
                k != 'title' &&
                k != 'text' &&
                k != 'store' &&
                k != 'fieldLabel' &&
                k != 'boxLabel' &&
                k != 'valueField' &&
                k != 'displayField' &&
                k != 'cls' &&
                k != 'disabled' &&
                k != 'hidden' &&
                k != 'name' &&
                k != 'value' &&
                k != 'iconCls' &&
                k != 'valid' &&
                k != 'minValue' &&
                k != 'maxValue' &&
                k != 'html' &&
                k != 'layout' &&
                k != 'headerId'
            );
        }
    };

    JsTester_Debugger.apply(this, arguments);

    this.printExtJsComponent = function (component) {
        this.printWithSpecificStyle(component, cont);
    };
}
