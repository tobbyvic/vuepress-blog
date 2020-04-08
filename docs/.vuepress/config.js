module.exports = {
    title: 'tobbyvic blog',
    description: '日拱一卒，功不唐捐',

    themeConfig: {
        // logo: '/',
        // 导航栏
        nav: [
            { text: '前端', link: '/frontend/nodejs-eventloop' },
            // { text: 'Author', link: '/Author' },
            { text: '服务端', link: '/server/learn-server' },
            { text: 'Github', link: 'https://github.com/tobbyvic' },
        ],
        // 侧边栏
        sidebar: {
            '/frontend/': [
                ['nodejs-eventloop', 'nodejs的事件循环要弄懂哦'],  /* /frontend/nodejs-eventloop.html */
                ['es6-extend', '超清晰图示ES5和ES6中的继承'],  /* /frontend/es6-extend.html */
                ['es6-class', '都2020了，用class来实现类吧']  /* /frontend/es6-class.html */
            ],
            '/server/': [
                ['learn-server', '学习服务端']  /* /frontend/learn-servers.html */
            ]
        }
        // sidebar: 'auto'
    }
}
