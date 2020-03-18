module.exports = {
    title: 'Hello VuePress',
    description: 'Just playing around',

    themeConfig: {
      // logo: '/',
      // 导航栏
      nav: [
        { text: 'Home', link: '/' },
        // { text: 'Author', link: '/Author' },
        // { text: 'Guide', link: '/guide/' },
        // { text: 'External', link: 'https://google.com' },
      ],
      // 侧边栏
      sidebar: {
          '/': [
          'front',  /* /foo/one.html */
          'end'   /* /foo/two.html */
        ],
        // '/bar/': [
        //   '',      /* /bar/ */
        //   'three', /* /bar/three.html */
        //   'four'   /* /bar/four.html */
        // ],
        // fallback 确保 fallback 侧边栏被最后定义。VuePress 会按顺序遍历侧边栏配置来寻找匹配的配置.
        // '/': [
        //   '',        /* / */
        //   'contact', /* /contact.html */
        //   'about'    /* /about.html */
        // ]
      }
    }
  }
