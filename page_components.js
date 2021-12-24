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
    constructor(isLoggedIn) { this.isLoggedIn = isLoggedIn; }
    async render() {
        return `
            <div class="navbar">
                <div class="container">
                    <a class="logo" href="/">Math<span>Blog</span></a>
                    <img id=open-menu class="mobile-menu" src="/images/menu.svg" alt="Open Navigation">
                    <nav>
                        <img id=exit-menu class="mobile-menu-exit" src="/images/exit.svg" alt="Close Navigation">
                        <ul class="primary-nav">
                            <li><a href="/index">Home</a></li>
                            <li><a href="/about">About</a></li>
                        </ul>
                        ${(this.isLoggedIn)?
                            `
                            <ul class="login-nav">
                                <li><a href="/post">Post</a></li>
                                <li><a href="/logout">Log out</a></li>
                            </ul>
                            `
                                :
                            `
                            <ul class="login-nav">
                                <li><a href="/login">Sign in</a></li>
                                <li><a href="/signup">Sign up</a></li>
                            </ul>
                            ` 
                        }
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

//TODO: Favarin, pq precisa do <label></label> vazio pras coisas ficarem na mesma coluna?
class Login {
    constructor(error) { this.error = error; }
    async render() {
        return `
            <section>
                <h1>Sign In</h1>
                <div class="login">
                    ${(this.error)? `<span style="color:red">${this.error}</span>` : ''}
                    <form method="post" action="login">
                        <label for="nickname">Nickname</label>
                        <input type="text" placeholder="Enter Nickname" name="nickname" autofocus>
                        <label for="password">Password</label>
                        <input type="password" placeholder="Enter Password" name="password">
                        <label>
                        </label>
                        <input type="submit" value="Login">
                    </form>
                </div>
            </section>
        `;
    }
};
class Signup {
    constructor(error) { this.error = error; }
    async render() {
        return `
            <section>
                <h1>Sign Up</h1>
                <div class="login">
                    ${(this.error)? `<span style="color:red">${this.error}</span>` : ''}
                    <form method="post" action="signup">
                        <label for="nickname">Nickname</label>
                        <input type="text" placeholder="Enter Nickname" name="nickname" autofocus>
                        <label for="password">Password</label>
                        <input type="password" placeholder="Enter Password" name="password">
                        <label for="repeat_password">Repeat Password</label>
                        <input type="password" placeholder="Enter Password" name="repeat_password">
                        <label>
                        </label>
                        <input type="submit" value="Sign Up">
                    </form>
                </div>
            </section>
        `;
    }
}
class NewPost { //TODO: Improve Textarea
    constructor() {}
    async render() {
        return `
            <section>
                <h1>New Post</h1>
                <div class="login">
                    <form method="post" action="post">
                        <label for="title">Title</label>
                        <input type="text" placeholder="Enter Title" name="title" autofocus>
                        <label for="postbody">Write Post</label>
                        <textarea name="postbody" rows=20 cols=150>Write Post</textarea>
                        <label>
                        </label>
                        <input type="submit" value="Submit">
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
        return `
        <style>
        .theorem {
            display: block;
            font-style: italic;
            }
            .theorem:before {
            content: "Theorem. ";
            font-weight: bold;
            font-style: normal;
            }
            .theorem[text]:before {
            content: "Theorem (" attr(text) ") ";
            }
            .definition {
            display: block;
            font-style: italic;
            }
            .definition:before {
            content: "Definition. ";
            font-weight: bold;
            font-style: normal;
            }
            .definition[text]:before {
            content: "Definition (" attr(text) ") ";
            }
            .hypothesis {
            display: block;
            font-style: italic;
            }
            .hypothesis:before {
            content: "Hypothesis. ";
            font-weight: bold;
            font-style: normal;
            }
            .hypothesis[text]:before {
            content: "Hypothesis (" attr(text) ") ";
            }
            .post-article {
                max-width: 64rem;
                margin: 4rem auto 4rem auto;
            }
        </style>
        <article class="post-article">
            ${this.text}
        </article>
        `;
    }
}


class MathJax {
    constructor() {}
    async render() {
        return `
            <script type="text/x-mathjax-config">
                MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$']]}});
            </script>
            <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
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
    NewPost,
};
