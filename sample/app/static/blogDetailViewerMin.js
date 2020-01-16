"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

axios.defaults.headers.common = {
  "Content-Type": "application/json"
};

var EditorButton = function EditorButton(props) {
  /*
  props:
  edit_enabled
  toggleModeCallback
  submitCallback
   */
  var handleReset = function handleReset(event) {
    location.reload();
  };

  var handleSubmit = function handleSubmit(event) {
    props.submitCallback();
  };

  if (props.edit_enabled) {
    return React.createElement(React.Fragment, null, React.createElement("button", {
      onClick: handleReset
    }, "Discard"), React.createElement("button", {
      onClick: handleSubmit
    }, "Save"));
  } else {
    return React.createElement(React.Fragment, null, React.createElement("button", {
      onClick: props.toggleModeCallback
    }, "Edit"));
  }
};

var BlogPostEditor =
/*#__PURE__*/
function (_React$Component) {
  _inherits(BlogPostEditor, _React$Component);

  /*
  props:
  post
   */
  function BlogPostEditor(props) {
    var _this;

    _classCallCheck(this, BlogPostEditor);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BlogPostEditor).call(this, props));
    _this.state = {
      alert_message: "",
      post: props.post ? props.post : {
        "id": null,
        "title": "",
        "body": "",
        "pub_date": null
      },
      edit_enabled: !props.post
    };
    _this.updatePostViaAPI = _this.updatePostViaAPI.bind(_assertThisInitialized(_this));
    _this.handleChange = _this.handleChange.bind(_assertThisInitialized(_this));
    _this.handleModeChange = _this.handleModeChange.bind(_assertThisInitialized(_this));
    _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(BlogPostEditor, [{
    key: "updatePostViaAPI",
    value: function updatePostViaAPI() {
      var request = {
        "csrf_token": CSRF_TOKEN,
        "title": this.state.post.title,
        "body": this.state.post.body,
        "pub_date": this.state.post.pub_date
      };
      axios.post("/blog_detail/" + this.state.post.id, request).then(function () {
        return location.reload();
      });
    }
  }, {
    key: "handleChange",
    value: function handleChange(e) {
      var name = e.target.name;
      var value = e.target.value;
      this.setState(function (s, p) {
        var new_post = Object.assign({}, s.post);
        new_post[name] = value;
        return {
          post: new_post
        };
      });
    }
  }, {
    key: "handleModeChange",
    value: function handleModeChange(e) {
      this.setState(function (s, p) {
        return {
          edit_enabled: !s.edit_enabled
        };
      });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit() {
      if (JSON.stringify(this.state.post.title) !== '{""}' && this.state.post.body.length >= 10) {
        this.updatePostViaAPI();
      } else {
        this.setState({
          alert_message: "A Post must have a title and at least 10 characters, try again :P!"
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.edit_enabled) {
        return React.createElement("div", {
          className: 'blog-post'
        }, React.createElement("input", {
          name: "title",
          value: this.state.post.title,
          type: "text",
          onChange: this.handleChange
        }), React.createElement("textarea", {
          name: "body",
          value: this.state.post.body,
          onChange: this.handleChange
        }), React.createElement(EditorButton, {
          edit_enabled: this.state.edit_enabled,
          toggleModeCallback: this.handleModeChange,
          submitCallback: this.handleSubmit
        }));
      } else {
        return React.createElement("div", {
          className: 'blog-post'
        }, React.createElement("h2", {
          className: "blog-post-title"
        }, this.state.post.title), React.createElement("div", {
          className: "blog-post-meta"
        }, this.state.post.pub_date), React.createElement("div", null, this.state.post.body), React.createElement("div", null, this.state.alert_message), React.createElement(EditorButton, {
          edit_enabled: this.state.edit_enabled,
          toggleModeCallback: this.handleModeChange,
          submitCallback: this.handleSubmit
        }));
      }
    }
  }]);

  return BlogPostEditor;
}(React.Component);

var container = document.getElementById("react-root");
ReactDOM.render(React.createElement(BlogPostEditor, {
  post: post
}), container);