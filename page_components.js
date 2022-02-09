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
    constructor(isLoggedIn, session) {
        this.isLoggedIn = isLoggedIn;
        this.nickname = session.nickname;
    }
    async render() {
        return `
            <div class="navbar">
                <div class="container">
                    <a class="logo" href="/" id="mathblog">Math<span>Blog</span></a>
                    <script src="/js/mathblog.js"></script>
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
                                <li><a href="/">Hello, ${this.nickname}</a></li>
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
                    <script src="/js/navbar.js"></script>
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
                            <a href="/posts/${post._id.toString()}" class="post-title">${post.title}
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
            <div class="login">
                <h1>Sign <span>In</span></h1>
                    ${(this.error)? `<span style="color:red; font-weight: bold;">${this.error}</span>` : ''}
                    <form method="post" action="login" id="form">
                        <label for="nickname">Nickname</label>
                        <input type="text" placeholder="Enter Nickname" name="nickname"
                        id="nickname" autofocus>
                        <p hidden class="hidden" id="empty_nickname">Empty nickname</p>
                        <label for="password">Password</label>
                        <input type="password" placeholder="Enter Password" name="password"
                        id="password">
                        <p hidden class="hidden" id="empty_password">Empty password</p>
                        <label>
                        </label>
                        <input type="submit" value="Login">
                    </form>
                </div>
                <script src="/js/sign_in.js"></script>
            </section>
        `;
    }
};

class Signup {
    constructor(error) { this.error = error; }
    async render() {
        return `
            <section>
            <div class="login">
                <h1>Sign <span>Up</span></h1>
                    ${(this.error)? `<span style="color:red">${this.error}</span>` : ''}
                    <form method="post" action="signup" id="form">
                        <label for="nickname">Nickname</label>
                        <input type="text" placeholder="Enter Nickname" name="nickname"
                        id="nickname"autofocus>
                        <p hidden class="hidden" id="invalid_nickname">Invalid Nickname</p>
                        <label for="password">Password</label>
                        <input type="password" placeholder="Enter Password" name="password"
                        id="first_password">
                        <p class="hidden" hidden id="invalid_first_password">Invalid Password</p>
                        <label for="repeat_password">Repeat Password</label>
                        <input type="password" placeholder="Enter Password" name="repeat_password"
                        id="second_password">
                        <p hidden class="hidden" id="invalid_second_password">Invalid Password</p>
                        <p hidden class="hidden" id="different_passwords">Different Passwords</p>
                        <label>
                        </label>
                        <input type="submit" value="Sign Up">
                        <p>Password Requirements:<p>
                        <div class="validator">
                        <p id="password_lowercase">a-z</p>
                        <p id="password_uppercase">A-Z</p>
                        <p id="password_number">0-9</p>
                        <p id="password_length">length >= 4</p>
                        </div>
                    </form>
                </div>
                <script src="/js/sign_up.js"></script>
            </section>
        `;
    }
}
class NewPost { //TODO: Improve Textarea
    constructor() {}
    async render() {
        return `
            <section>
                <div class="new-post">
                    <h1>New <span>Post</span></h1>
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

class EditPost { //TODO: Improve Textarea
    constructor(post) {
        this.post = post;
        console.log({post:this.post});
    }
    async render() {
        return `
            <section>
            <div class="new-post">
                <h1>Edit <span>Post</span></h1>
                    <form method="post" action="">
                        <label for="title">Title</label>
                        <input type="text" value=${this.post.title} name="title" autofocus>
                        <label for="postbody">Edit Post</label>
                        <textarea name="postbody" rows=20 cols=150>${this.post.latext}</textarea>
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
    constructor(canEdit, post) {
        this.canEdit = canEdit;
        this.text = post.latext;
        this.post_id = post._id;
        this.post_title = post.title;
        this.post_author = post.author;
    }
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
        <div class="actual-post">
        <h2>${this.post_title}</h2>
        <p>Author: ${this.post_author}</p>
        <script src="/js/text.js"></script>
        <article class="post-article">
            ${this.text}
        </article>
        <div class="edit-delete">
        ${(this.canEdit)? ` <form method="post" style="float:right;" action="/edit-post/${this.post_id}"> <input type="submit" value="Edit"> </form>
        <form method="post" style="float:left;" action="/delete-post/${this.post_id}"> <input type="submit" value="Delete"> </form>` : ''}
        </div>
        </div>
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
    EditPost,
};
