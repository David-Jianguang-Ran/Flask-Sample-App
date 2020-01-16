# coding: utf-8

from datetime import datetime
import os

from flask import flash, Flask, redirect, render_template, request, session, jsonify, url_for
from flask.views import View
from flask_login import current_user, login_required, login_user, LoginManager, logout_user, UserMixin
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from werkzeug.debug import DebuggedApplication
from wtforms import PasswordField, StringField
from wtforms.validators import DataRequired

from app import commands

import calendar
from uuid import uuid4
from json import dumps

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}:3306/{}'.format(
    os.getenv('MYSQL_USERNAME', 'web_user'),
    os.getenv('MYSQL_PASSWORD', 'password'),
    os.getenv('MYSQL_HOST', 'db'), os.getenv('MYSQL_DATABASE', 'sample_app'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'this is something special'

if app.debug:
    app.wsgi_app = DebuggedApplication(app.wsgi_app, True)

db = SQLAlchemy(app)
commands.init_app(app, db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id) if user_id else None


# db models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(120))

    def __repr__(self):
        return '<User %r>' % self.email

    def check_password(self, password):
        return self.password == password


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80))
    body = db.Column(db.Text)
    pub_date = db.Column(db.DateTime)

    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship(
        'Category', backref=db.backref('posts', lazy='dynamic'))

    def __init__(self, title, body, category, pub_date=None):
        self.title = title
        self.body = body
        if pub_date is None:
            pub_date = datetime.utcnow()
        self.pub_date = pub_date
        self.category = category

    def __repr__(self):
        return '<Post %r>' % self.title


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Category %r>' % self.name


# utility
def enforce_csrf(decoratee):
    """ this decorator is meant to modify post request handlers """

    def _fail(*args):
        raise RuntimeError("csrf failed for request: {}".format(args[0].request))

    def _inner(*args, **kwargs):
        if not args[0].session['csrf_token']:
            return _fail(*args)
        elif str(args[0].session['csrf_token']) == args[0].request.get_json()['csrf_token']:
            return decoratee(*args, **kwargs)
        else:
            return _fail(*args)

    return _inner


# base modules
class DavidsViewBase(View):
    """
    This class is sort of a django generic template view
    """
    template_name = ""
    insert_csrf = False
    
    def get_object(self):
        return {}
    
    def get(self):
        """ simple object - template response as a default"""
        context = {
            "object": self.get_object()
        }
        
        if self.insert_csrf:
            context['csrf_token'] = self.session['csrf_token']

        return render_template(self.template_name, context=context)
    
    def post(self):
        """ Override to implement post method handler"""
        pass
    
    def get_csrf_token(self):
        if not self.session.get('csrf_token'):
            self.session['csrf_token'] = uuid4()
    
    def dispatch_request(self, *args, **kwargs):
        self.request = request
        self.session = session
        
        if self.insert_csrf:
            self.get_csrf_token()
        
        if self.request.method == "GET":
            return self.get()
        elif self.request.method == "POST":
            return self.post()
        else:
            # too lazy to define my own exceptions, 400 Error for everyone, woo!
            raise RuntimeError("Bad request, expect to see a 400")


# url rule : /blog_detail/<blog_id>
class BlogDetailView(DavidsViewBase):
    template_name = "blog_detail.html"
    insert_csrf = True
    
    def get_object(self):
        post = db.session.query(Post).get(self.request.view_args.get('post_id'))
        return {
            "id": post.id,
            "title": post.title,
            "body": post.body,
            "pub_date": str(post.pub_date)
        }
    
    @enforce_csrf
    def post(self):
        # first we get a post object, create one if no post id is named
        data = self.request.get_json()
        print(data)
        if not self.request.view_args.get('post_id'):
            post = Post(title=None, body=None, category=None)
            db.session.add(post)
        else:
            post = db.session.query(Post).get(self.request.view_args.get('post_id'))
        
        # modify post
        post.title = data['title']
        post.body = data['body']
        
        if data.get('catagory_id'):
            post.category_id = data['catagory_id']
        
        # save to db
        db.session.commit()
        
        print(post.id)
        
        return redirect("/blog_detail/{}".format(post.id))


# url rule : /blog
class BlogListView(DavidsViewBase):
    template_name = "blog_list.html"
    
    def get_object(self, page=0, time_filter=None):
        """
        inplement main filter query method here,
        no args default to all blogs page one
        :param page:
        :param time_filter: [ month year]
        :return: list o post obj
        """
        query_set = db.session.query(Post).filter()
        
        if time_filter:
            year = int(time_filter[0])
            month = int(time_filter[1]) + 1
            month_last_day = calendar.monthrange(year, month)[1]
            filter_lower = datetime(year=year,
                                    month=month,
                                    day=1)
            filter_upper = datetime(year=year,
                                    month=month,
                                    day=month_last_day)
            query_set = query_set.filter(Post.pub_date.between(filter_lower,filter_upper))
        
        # process query set into list of dict
        result =[{
            "id" : each_post.id,
            "title" : each_post.title,
            "body": each_post.body,
            "pub_date": str(each_post.pub_date)
        } for each_post in query_set[page*10:(page+1)*10]]
        
        return result
        
    def post(self):
        data = request.get_json()
        print(data)
        
        posts = self.get_object(
            page=data['page'],
            time_filter=data['time_filter']
        )
        
        response = {
            "time_filter": data['time_filter'],
            "posts": posts
        }
        
        return jsonify(response)


# views and routes
@app.route("/")
def index():
    return redirect(url_for("blog_list"))


@app.route("/about_me")
def about_me_view():
    return render_template("about_me.html")


app.add_url_rule("/blog_detail/<post_id>",
                 view_func=BlogDetailView.as_view("blog_detail"),
                 methods=["GET","POST"]
                 )

app.add_url_rule("/blog_list",
                 view_func=BlogListView.as_view("blog_list"),
                 methods=["GET","POST"]
                 )


# login / auth stuff
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        FlaskForm.__init__(self, *args, **kwargs)
        self.user = None

    def validate(self):
        rv = FlaskForm.validate(self)
        if not rv:
            return False

        user = User.query.filter_by(email=self.email.data).one_or_none()
        if user:
            password_match = user.check_password(self.password.data)
            if password_match:
                self.user = user
                return True

        self.password.errors.append('Invalid email and/or password specified.')
        return False


@app.route('/auth/login/', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        login_user(form.user)
        flash('Logged in successfully.')
        return redirect(request.args.get('next') or url_for('index'))

    return render_template('login.html', form=form)


@app.route('/logout/')
@login_required
def logout():
    logout_user()
    return redirect(request.args.get('next') or url_for('index'))


@app.route('/account/')
@login_required
def account():
    return render_template('account.html', user=current_user)


@app.before_first_request
def initialize_data():
    # just make sure we have some sample data, so we can get started.
    user = User.query.filter_by(email='blogger@sample.com').one_or_none()
    if user is None:
        user = User(email='blogger@sample.com', password='password')
        db.session.add(user)
        db.session.commit()
      
    post = Post(
        title=str(uuid4()),
        body=str(uuid4()),
        category=None
    )
    
    db.session.add(post)
    db.session.commit()


if __name__ == "__main__":
    app.run()
