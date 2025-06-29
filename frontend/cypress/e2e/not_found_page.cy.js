/* eslint-disable no-undef */
describe('404页面测试', () => {
    beforeEach(() => {
        // 设置无障碍性检查规则
        cy.injectAxe();
        cy.configureAxe({
            rules: [
                { id: 'landmark-one-main', enabled: false },
                { id: 'page-has-heading-one', enabled: false },
                { id: 'region', enabled: false },
                { id: 'color-contrast', enabled: false },
                { id: 'aria-command-name', enabled: false },
                { id: 'landmark-banner-is-top-level', enabled: false },
                { id: 'landmark-no-duplicate-banner', enabled: false },
                { id: 'landmark-unique', enabled: false },
                { id: 'aria-allowed-attr', enabled: false },
                { id: 'button-name', enabled: false }
            ]
        });
    });

    it('访问不存在的页面应该显示404页面', () => {
        // 访问一个不存在的页面
        cy.visit('/non-existent-page');

        // 验证404页面内容
        cy.contains('页面未找到').should('be.visible');
        cy.contains('抱歉，您访问的页面不存在').should('be.visible');

        // 验证搜索功能
        cy.get('input[placeholder="搜索页面或内容..."]').should('be.visible');
        cy.contains('搜索').should('be.visible').and('be.disabled');

        // 验证导航按钮
        cy.contains('返回上页').should('be.visible');
        cy.contains('回到首页').should('be.visible');

        // 检查无障碍性
        cy.checkA11y();
    });

    it('搜索功能应该正常工作', () => {
        cy.visit('/404');

        const searchInput = cy.get('input[placeholder="搜索页面或内容..."]');
        const searchButton = cy.contains('搜索');

        // 初始状态搜索按钮应该被禁用
        searchButton.should('be.disabled');

        // 输入搜索内容
        searchInput.type('测试搜索');

        // 搜索按钮应该启用
        searchButton.should('not.be.disabled');

        // 点击搜索按钮
        searchButton.click();

        // 应该跳转到首页并带有搜索参数
        cy.url().should('include', '/?search=');
        cy.url().should('include', encodeURIComponent('测试搜索'));
    });

    it('按回车键应该触发搜索', () => {
        cy.visit('/404');

        const searchInput = cy.get('input[placeholder="搜索页面或内容..."]');

        // 输入搜索内容并按回车
        searchInput.type('回车搜索{enter}');

        // 应该跳转到首页并带有搜索参数
        cy.url().should('include', '/?search=');
        cy.url().should('include', encodeURIComponent('回车搜索'));
    });

    it('回到首页按钮应该正常工作', () => {
        cy.visit('/404');

        // 点击回到首页按钮
        cy.contains('回到首页').click();

        // 应该跳转到首页
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('返回上页按钮应该正常工作', () => {
        // 先访问首页，然后访问404页面，模拟有历史记录的情况
        cy.visit('/');
        cy.visit('/404');

        // 点击返回上页按钮
        cy.contains('返回上页').click();

        // 应该返回到首页
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('404页面不应该显示导航栏', () => {
        cy.visit('/404');

        // 验证导航栏不存在
        cy.get('nav').should('not.exist');

        // 验证底部导航也不存在（移动端）
        cy.get('[data-testid="bottom-nav"]').should('not.exist');
    });

    it('404页面应该支持暗色主题', () => {
        cy.visit('/404');

        // 模拟设置暗色主题
        cy.window().then((win) => {
            win.document.documentElement.setAttribute('data-theme', 'dark');
        });

        // 验证页面仍然正常显示
        cy.contains('页面未找到').should('be.visible');
        cy.contains('搜索页面或内容').should('be.visible');

        // 检查无障碍性
        cy.checkA11y();
    });

    it('404页面应该在移动端正常显示', () => {
        // 设置移动端视口
        cy.viewport('iphone-x');
        cy.visit('/404');

        // 验证页面内容在移动端正常显示
        cy.contains('页面未找到').should('be.visible');
        cy.get('input[placeholder="搜索页面或内容..."]').should('be.visible');

        // 验证按钮在移动端的布局
        cy.contains('返回上页').should('be.visible');
        cy.contains('回到首页').should('be.visible');

        // 检查无障碍性
        cy.checkA11y();
    });

    it('404页面的插图应该正常显示', () => {
        cy.visit('/404');

        // 验证SVG插图存在
        cy.get('svg[aria-hidden="true"]').should('exist');

        // 验证插图有正确的viewBox
        cy.get('svg[viewBox="0 0 362 145"]').should('exist');
    });

    it('搜索输入框应该有正确的可访问性属性', () => {
        cy.visit('/404');

        const searchInput = cy.get('input[placeholder="搜索页面或内容..."]');

        // 验证aria-label
        searchInput.should('have.attr', 'aria-label', '搜索');

        // 验证输入框可以获得焦点
        searchInput.focus().should('be.focused');
    });
}); 