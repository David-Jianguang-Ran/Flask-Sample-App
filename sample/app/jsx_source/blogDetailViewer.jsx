axios.defaults.headers.common = {
  "Content-Type": "application/json"
}


const EditorButton         = function (props) {
  /*
  props:
  edit_enabled
  toggleModeCallback
  submitCallback
   */
  const handleReset               = function (event) {
    location.reload()
  }

  const handleSubmit              = function (event) {
    props.submitCallback()
  }

  if (props.edit_enabled) {
      return (
          <React.Fragment>
            <button onClick={handleReset}>
              Discard
            </button>
            <button onClick={handleSubmit}>
              Save
            </button>
          </React.Fragment>
      )
    } else {
      return (
          <React.Fragment>
            <button onClick={props.toggleModeCallback}>
              Edit
            </button>
          </React.Fragment>
      )
    }

}


class BlogPostEditor extends React.Component {
  /*
  props:
  post
   */
  constructor (props) {
    super(props)

    this.state = {
      alert_message: "",
      post: (props.post? props.post : {
          "id" : null,
          "title" : "",
          "body" : "",
          "pub_date" : null
      }),
      edit_enabled : !props.post,
    }

    this.updatePostViaAPI = this.updatePostViaAPI.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

  }

  updatePostViaAPI () {
    let request = {
      "csrf_token" : CSRF_TOKEN,
      "title" : this.state.post.title,
      "body" : this.state.post.body,
      "pub_date": this.state.post.pub_date
    }

    axios.post("/blog_detail/" + this.state.post.id, request).then(()=>(location.reload()))
  }

  handleChange (e) {
    let name = e.target.name
    let value = e.target.value

    this.setState(function (s,p) {
      let new_post = Object.assign({}, s.post)
      new_post[name] = value
      return {
        post : new_post
      }
    })
  }

  handleModeChange (e) {
    this.setState((s,p) => ({
      edit_enabled: !s.edit_enabled
    }))
  }

  handleSubmit () {
    if (JSON.stringify(this.state.post.title) !== '{""}' && this.state.post.body.length >= 10) {
      this.updatePostViaAPI()
    } else {
      this.setState({
        alert_message: "A Post must have a title and at least 10 characters, try again :P!"
      })
    }
  }

  render () {
    if (this.state.edit_enabled) {
      return (
          <div className={'blog-post'}>
            <input className={"blog-post-title"}
                   name={"title"}
                   value={this.state.post.title}
                   type={"text"}
                   onChange={this.handleChange}
            />
            <textarea name={"body"}
                      value={this.state.post.body}
                      onChange={this.handleChange}
            />
            <EditorButton edit_enabled={this.state.edit_enabled}
                          toggleModeCallback={this.handleModeChange}
                          submitCallback={this.handleSubmit}
            />
          </div>
      )
    } else {
      return (
          <div className={'blog-post'}>
            <h2 className={"blog-post-title"}>
              {this.state.post.title}
            </h2>
            <div className={"blog-post-meta"}>{this.state.post.pub_date}</div>
            <div>
              {this.state.post.body}
            </div>

            <div>{this.state.alert_message}</div>
            <EditorButton edit_enabled={this.state.edit_enabled}
                          toggleModeCallback={this.handleModeChange}
                          submitCallback={this.handleSubmit}
            />
          </div>
      )
    }
  }
}

let container = document.getElementById("react-root")

ReactDOM.render(
    <BlogPostEditor post={post}/>
    ,
    container
)