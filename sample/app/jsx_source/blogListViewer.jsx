axios.defaults.headers.common = {
  "Content-Type": "application/json"
}

const MONTH_NAMES = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ]


const ArchiveIndividual = function (p) {
  /*
  props:
  date_obj
  setTimeFilterCallback
   */

  const handleClick = function (e) {
    p.setTimeFilterCallback(p.date_obj)
  }

  const date_string = MONTH_NAMES[p.date_obj.getMonth()] + " - " + p.date_obj.getFullYear()

  return (
      <React.Fragment>
        <li onClick={handleClick}>{date_string}</li>
      </React.Fragment>
  )
}


class ArchiveBar extends React.Component{
  /*
  displays 12 monthly time filters, click to roll down
  props:
  setTimeFilterCallback
   */
  constructor (props) {
    super(props)

    this.state = {
        page_num : 0
    }

    this.pageUp = this.pageUp.bind(this)
    this.pageDown = this.pageDown.bind(this)
    this.getArchives = this.getArchives.bind(this)
  }

  pageUp (e) {
    if (this.state.page_num === 0) {
      // do nothing
    } else {
      this.setState((s,p) => ({
        page_num: s.page_num - 1
      }))
    }
  }

  pageDown (e) {
    this.setState((s,p) => ({
      page_num: s.page_num + 1
    }))
  }

  // render hooks
  getArchives () {
    let output = []
    let i = 0
    // TODO refactor below hard coded constant into setting var
    while (i <= 12) {
      let date_obj = new Date(Date.now())
      date_obj.setMonth(date_obj.getMonth() - (i + this.state.page_num * 12))
      output.push(
          <ArchiveIndividual date_obj={date_obj}
                             setTimeFilterCallback={this.props.setTimeFilterCallback}
                             key={i}
          />
      )
      i += 1
    }
    return output
  }

  render () {
    return (
        <div className={"sidebar-module"}>
          <button onClick={this.pageUp}>Newer</button>
          <h4>Archives</h4>
          <ul>
            {this.getArchives()}
          </ul>
          <button onClick={this.pageDown}>Older</button>
        </div>
    )
  }
}


const BlogIndividual = function (p) {
  /*
  props:
  post : {
      id :
      title :
      body :
      pub_date :
  }
   */

  const goToPostDetail = function () {
    window.location.assign("/blog_detail/" + p.post.id)
  }

  return (
      <div className={'blog-post'}>
        <h2 className={"blog-post-title"}
            onClick={goToPostDetail}>
          {p.post.title}
        </h2>
        <div className={"blog-post-meta"}>{p.post.pub_date}</div>
        <div>
          {p.post.body}
        </div>
      </div>
  )
}


class BlogListViewer extends React.Component{
  /*
  props:
  none
   */

  constructor(props){
    super(props)

    this.state = {
      posts : props.initial_data,
      post_time_filter : null,
      page_num : 0,
    }

    this.getBlogPostDataViaAPI = this.getBlogPostDataViaAPI.bind(this)
    this.getBlogPostDataViaAPIDone = this.getBlogPostDataViaAPIDone.bind(this)
    this.setTimeFilter = this.setTimeFilter.bind(this)
    this.changePage = this.changePage.bind(this)
    this.getBlogPosts = this.getBlogPosts.bind(this)
    this.getBlogAreaTitle = this.getBlogAreaTitle.bind(this)
  }

  // data & API
  getBlogPostDataViaAPI (time_filter=null,page_num=0) {
    let request = {
      "page" : page_num,
      "time_filter" : (time_filter? [time_filter.getFullYear(), time_filter.getMonth()] : null),
    }

    axios.post(window.location,request).then(this.getBlogPostDataViaAPIDone)
  }

  getBlogPostDataViaAPIDone (response) {
    console.log('blog list data from backend ')
    console.log(response)
    let new_time_filter = (response.data.time_filter? new Date(response.data.time_filter[0],response.data.time_filter[1]) : null)
    console.log(new_time_filter)
    this.setState({
      posts : response.data.posts,
      post_time_filter : new_time_filter
    })
  }

  // callbacks
  setTimeFilter (date_obj) {
    this.setState({
      page_num : 0
    })
    this.getBlogPostDataViaAPI(date_obj)
  }

  changePage (up=true) {
    // bail early if cannot page down
    if (this.state.page_num === 0 && !up) {
      return null
    }

    const page_num_next = (up? this.state.page_num+1 : this.state.page_num-1)

    this.setState((s,p) => ({
      page_num :  page_num_next
    }))

    this.getBlogPostDataViaAPI(this.state.post_time_filter,page_num_next)
  }

  // render hooks
  getBlogPosts () {
    let output = []
    for (let i in this.state.posts) {
      output.push(
          <BlogIndividual post={this.state.posts[i]} key={i}/>
      )
    }
    return output
  }

  getBlogAreaTitle () {
    let title_string = (this.state.post_time_filter ?
        <ArchiveIndividual date_obj={this.state.post_time_filter}
                           setTimeFilterCallback={()=>("this method is intentionally left black")}
        /> :
        "Showing All Posts")
    let prev_button = (
        <button onClick={(e)=>(
            this.changePage(false)
        )}>Prev</button>
    )

    return (
        <div>
          {this.state.page_num === 0 ? null : prev_button}

          {title_string}

          <button onClick={(e)=>(
              this.changePage(true)
          )}>Next</button>
        </div>
    )
  }

  render () {
    return (
        <div className={"row"}>

          <div className={"col-sm-8 blog-main"}>
            {this.getBlogAreaTitle()}
            {this.getBlogPosts()}
          </div>

          <div className={"col-sm-3 offset-sm-1 blog-sidebar"}>
            <ArchiveBar setTimeFilterCallback={this.setTimeFilter}/>
          </div>

        </div>
    )
  }
}


let container = document.getElementById("react-root")

ReactDOM.render(
    <BlogListViewer initial_data={initial_data}/>,
    container
)