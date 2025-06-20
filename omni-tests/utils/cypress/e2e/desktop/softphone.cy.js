describe(
    'Открываю десктопное приложение. Ввожу логин и пароль. Нажимаю на кнопку "Войти". Отправлен запрос авторизации.',
() => {
    let loginRequest;

    beforeEach(() => {
        cy.unauthorized();

        cy.visit('https://go.localhost.uis.st:8080')

        cy.textField()
            .withLabel('Логин')
            .type('botusharova');

        cy.textField()
            .withLabel('Пароль')
            .type('8Gls8h31agwLf5k');

        loginRequest = cy.loginRequest.interceptFor.spying;

        cy.button('Войти').click();
        loginRequest.shouldBeSent();
    });

    it('Кнопка "Войти" заблокирована.', () => {
        cy.button('Войти').should('be.disabled');
    });
});
