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
var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var ArchiveIndividual = function ArchiveIndividual(p) {
  /*
  props:
  date_obj
  setTimeFilterCallback
   */
  var handleClick = function handleClick(e) {
    p.setTimeFilterCallback(p.date_obj);
  };

  var date_string = MONTH_NAMES[p.date_obj.getMonth()] + " - " + p.date_obj.getFullYear();
  return React.createElement(React.Fragment, null, React.createElement("li", {
    onClick: handleClick
  }, date_string));
};

var ArchiveBar =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ArchiveBar, _React$Component);

  /*
  displays 12 monthly time filters, click to roll down
  props:
  setTimeFilterCallback
   */
  function ArchiveBar(props) {
    var _this;

    _classCallCheck(this, ArchiveBar);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ArchiveBar).call(this, props));
    _this.state = {
      page_num: 0
    };
    _this.pageUp = _this.pageUp.bind(_assertThisInitialized(_this));
    _this.pageDown = _this.pageDown.bind(_assertThisInitialized(_this));
    _this.getArchives = _this.getArchives.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ArchiveBar, [{
    key: "pageUp",
    value: function pageUp(e) {
      if (this.state.page_num === 0) {// do nothing
      } else {
        this.setState(function (s, p) {
          return {
            page_num: s.page_num - 1
          };
        });
      }
    }
  }, {
    key: "pageDown",
    value: function pageDown(e) {
      this.setState(function (s, p) {
        return {
          page_num: s.page_num + 1
        };
      });
    } // render hooks

  }, {
    key: "getArchives",
    value: function getArchives() {
      var output = [];
      var i = 0; // TODO refactor below hard coded constant into setting var

      while (i <= 12) {
        var date_obj = new Date(Date.now());
        date_obj.setMonth(date_obj.getMonth() - (i + this.state.page_num * 12));
        output.push(React.createElement(ArchiveIndividual, {
          date_obj: date_obj,
          setTimeFilterCallback: this.props.setTimeFilterCallback,
          key: i
        }));
        i += 1;
      }

      return output;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", {
        className: "sidebar-module"
      }, React.createElement("button", {
        onClick: this.pageUp
      }, "Newer"), React.createElement("h4", null, "Archives"), React.createElement("ul", null, this.getArchives()), React.createElement("button", {
        onClick: this.pageDown
      }, "Older"));
    }
  }]);

  return ArchiveBar;
}(React.Component);

var BlogIndividual = function BlogIndividual(p) {
  /*
  props:
  post : {
      id :
      title :
      body :
      pub_date :
  }
   */
  var goToPostDetail = function goToPostDetail() {
    window.location.assign("/blog_detail/" + p.post.id);
  };

  return React.createElement("div", {
    className: 'blog-post'
  }, React.createElement("h2", {
    className: "blog-post-title",
    onClick: goToPostDetail
  }, p.post.title), React.createElement("div", {
    className: "blog-post-meta"
  }, p.post.pub_date), React.createElement("div", null, p.post.body));
};

var BlogListViewer =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(BlogListViewer, _React$Component2);

  /*
  props:
  none
   */
  function BlogListViewer(props) {
    var _this2;

    _classCallCheck(this, BlogListViewer);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(BlogListViewer).call(this, props));
    _this2.state = {
      posts: props.initial_data,
      post_time_filter: null,
      page_num: 0
    };
    _this2.getBlogPostDataViaAPI = _this2.getBlogPostDataViaAPI.bind(_assertThisInitialized(_this2));
    _this2.getBlogPostDataViaAPIDone = _this2.getBlogPostDataViaAPIDone.bind(_assertThisInitialized(_this2));
    _this2.setTimeFilter = _this2.setTimeFilter.bind(_assertThisInitialized(_this2));
    _this2.changePage = _this2.changePage.bind(_assertThisInitialized(_this2));
    _this2.getBlogPosts = _this2.getBlogPosts.bind(_assertThisInitialized(_this2));
    _this2.getBlogAreaTitle = _this2.getBlogAreaTitle.bind(_assertThisInitialized(_this2));
    return _this2;
  } // data & API


  _createClass(BlogListViewer, [{
    key: "getBlogPostDataViaAPI",
    value: function getBlogPostDataViaAPI() {
      var time_filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var page_num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var request = {
        "page": page_num,
        "time_filter": time_filter ? [time_filter.getFullYear(), time_filter.getMonth()] : null
      };
      axios.post(window.location, request).then(this.getBlogPostDataViaAPIDone);
    }
  }, {
    key: "getBlogPostDataViaAPIDone",
    value: function getBlogPostDataViaAPIDone(response) {
      console.log('blog list data from backend ');
      console.log(response);
      var new_time_filter = response.data.time_filter ? new Date(response.data.time_filter[0], response.data.time_filter[1]) : null;
      console.log(new_time_filter);
      this.setState({
        posts: response.data.posts,
        post_time_filter: new_time_filter
      });
    } // callbacks

  }, {
    key: "setTimeFilter",
    value: function setTimeFilter(date_obj) {
      this.setState({
        page_num: 0
      });
      this.getBlogPostDataViaAPI(date_obj);
    }
  }, {
    key: "changePage",
    value: function changePage() {
      var up = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      // bail early if cannot page down
      if (this.state.page_num === 0 && !up) {
        return null;
      }

      var page_num_next = up ? this.state.page_num + 1 : this.state.page_num - 1;
      this.setState(function (s, p) {
        return {
          page_num: page_num_next
        };
      });
      this.getBlogPostDataViaAPI(this.state.post_time_filter, page_num_next);
    } // render hooks

  }, {
    key: "getBlogPosts",
    value: function getBlogPosts() {
      var output = [];

      for (var i in this.state.posts) {
        output.push(React.createElement(BlogIndividual, {
          post: this.state.posts[i],
          key: i
        }));
      }

      return output;
    }
  }, {
    key: "getBlogAreaTitle",
    value: function getBlogAreaTitle() {
      var _this3 = this;

      var title_string = this.state.post_time_filter ? React.createElement(ArchiveIndividual, {
        date_obj: this.state.post_time_filter,
        setTimeFilterCallback: function setTimeFilterCallback() {
          return "this method is intentionally left black";
        }
      }) : "Showing All Posts";
      var prev_button = React.createElement("button", {
        onClick: function onClick(e) {
          return _this3.changePage(false);
        }
      }, "Prev");
      return React.createElement("div", null, this.state.page_num === 0 ? null : prev_button, title_string, React.createElement("button", {
        onClick: function onClick(e) {
          return _this3.changePage(true);
        }
      }, "Next"));
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement("div", {
        className: "row"
      }, React.createElement("div", {
        className: "col-sm-8 blog-main"
      }, this.getBlogAreaTitle(), this.getBlogPosts()), React.createElement("div", {
        className: "col-sm-3 offset-sm-1 blog-sidebar"
      }, React.createElement(ArchiveBar, {
        setTimeFilterCallback: this.setTimeFilter
      })));
    }
  }]);

  return BlogListViewer;
}(React.Component);

var container = document.getElementById("react-root");
ReactDOM.render(React.createElement(BlogListViewer, {
  initial_data: initial_data
}), container);