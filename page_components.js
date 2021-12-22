// Components for building HTML+CSS+JS pages.
var mongoClient = require('mongodb').MongoClient;

const DBURL   = 'mongodb://localhost:27017/';
const DBNAME  = 'mathblog';


class Page {
    constructor(title) {
        this.title = title;
        this.bodyComponents = [];
        this.headComponents = [];
    }
    async render(){

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'>
                <meta name='viewport' content='width=device-width, initial-scale=1'>
                <title>${this.title}</title>
                ${(await Promise.all(this.headComponents.map(async (hc) => hc.render()))).join('\n')}
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                ${(await Promise.all(this.bodyComponents.map(async (bc) => bc.render()))).join('\n')}
            </body>
            </html>
        `;
    }
    addBodyComponent(c) { this.bodyComponents.push(c); }
    addHeadComponent(c) { this.headComponents.push(c); }
}


class Navbar {
    constructor() {}
    async render() {
        return `
            <div class="navbar">
                <div class="container">
                    <a class="logo" href="/">Math<span>Blog</span></a>
                    <img id=open-menu class="mobile-menu" src="/images/menu.svg" alt="Open Navigation">
                    <nav>
                        <img id=exit-menu class="mobile-menu-exit" src="/images/exit.svg" alt="Close Navigation">
                        <ul class="primary-nav">
                            <li><a href="/index.html">Home</a></li>
                            <li><a href="/about.html">About</a></li>
                        </ul>
                        <ul class="login-nav">
                            <li><a href="./login.html">Sign in</a></li>
                            <li><a href="./signup.html">Sign up</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;
    }
}


class Posts {
    constructor(post_db) { this.post_db = post_db; }
    async render() {
        let db = await mongoClient.connect(DBURL);
        let dbo = db.db(DBNAME);
        let res = await dbo.collection('posts').find({}).toArray();
        await db.close();

        return `
            <section class="posts">
                <div class="container">
                    <h1>Latest Posts</h1>
                    <ul>
                        ${res.map(post => `
                        <li>
                            <a href="${post.path}" class="post-title">${post.name}
                                <cite class="post-cite">${post.author}</cite>
                                <img src="images/illustration.svg" class="post-image" alt="Illustration">
                            </a>
                        </li>
                        `).join('\n')}
                    </ul>
                </div>
            </section>
        `;
    }
}


class Login {
    constructor() {}
    async render() {
        return `
            <section>
                <h1>Sign In</h1>
                <div class="login">
                    <form action="">
                        <label for="nickname">Nickname</label>
                        <input type="text" placeholder="Enter Nickname" name="nickname">
                        <label for="password">Password</label>
                        <input type="password" placeholder="Enter Password" name="password">
                        <label>
                            <input type="checkbox" name="remember"> Remember me
                        </label>
                        <input type="submit" value="Login">
                    </form>
                </div>
            </section>
        `;
    }
};

class Signup {
    constructor() {}
    async render() {
        return `
            <section>
                <h1>Sign Up</h1>
                <div class="login">
                    <form action="">
                        <label for="nickname">Nickname</label>
                        <input type="text" placeholder="Enter Nickname" name="nickname">
                        <label for="password">Password</label>
                        <input type="password" placeholder="Enter Password" name="password">
                        <label for="repeat_password">Repeat Password</label>
                        <input type="password" placeholder="Enter Password" name="repeat_password">
                        <label>
                            <input type="checkbox" name="remember"> Remember me
                        </label>
                        <input type="submit" value="Sign Up">
                    </form>
                </div>
            </section>
        `;
    }
}


// This should be forked into a Post component.
class Text {
    constructor(text) { this.text = text; }
    async render() {
        return this.text;
    }
}


class MathJax {
    constructor() {}
    async render() {
        return `
            <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
            <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        `;
    }
}

// require('page_components') returns an object whose elements are Page, Navbar, etc.
module.exports = {
    Page,
    Navbar,
    Posts,
    Login,
    Signup,
    Text,
    MathJax,
};
