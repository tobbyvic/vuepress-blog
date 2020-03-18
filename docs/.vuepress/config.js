module.exports = {
    title: 'tobbyvic blog',
    description: '日拱一卒，功不唐捐',

    themeConfig: {
        // logo: '/',
        // 导航栏
        nav: [
            { text: '前端', link: '/frontend/learn-frontend' },
            // { text: 'Author', link: '/Author' },
            { text: '服务端', link: '/server/learn-server' },
            { text: 'Github', link: 'https://github.com/tobbyvic' },
        ],
        // 侧边栏
        sidebar: {
            '/frontend/': [
                ['learn-frontend', '学习前端']  /* /frontend/learn-frontend.html */
            ],
            '/server/': [
                ['learn-server', '学习服务端']  /* /frontend/learn-servers.html */
            ]
        }
    }
}