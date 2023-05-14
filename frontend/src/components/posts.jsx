import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
//import ListGroup from "./common/listGroup";
import { getPosts, getMyPosts, deletePost, searchPosts } from "../services/postService";
import _ from "lodash";
import auth from "../services/authService";
import SearchBox from "./searchBox";
import Form from "./common/form";

class Posts extends Component {
  state = {
    posts: [],
    userId: "",
    myPosts: false,
    search: ""
  };
  constructor() {
    super();
    console.log('constructor');
  }
  
  // loadPosts() {
  //   const {myPosts} = this.props;
  //   this.setState({
  //     myPosts:myPosts
  //   });
  // }

  async componentDidMount() {
    const currentUser = auth.getCurrentUser();
    const userId = (currentUser) ? currentUser._id : ""; 
    const {myPosts} = this.props;
    this.setState({
      ...this.state, myPosts:myPosts
    });
    let response;
    if(this.state.myPosts)
      response = await getMyPosts();
    else
      response = await getPosts();
    const posts = [...response.data.result];    
    this.setState({ posts: posts, userId: userId });
    console.log(this.state.userId);
  }

  handleDelete = async post => {
    if(window.confirm('Do you want to delete the post with title ?')){
      const originalPosts = this.state.posts;
      const posts = originalPosts.filter(m => m.id !== post.blog_id);
      this.setState({ posts: posts });
  
      try {
        const response = await deletePost(post.blog_id);
        toast.success("Post deleted!!");
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("This post has already been deleted.");
  
        this.setState({ posts: originalPosts });
      }
    }
  };

  handleSearch = async () =>{
    this.setState({ posts: []});
    let response;
    if(!this.state.search){
      response = await getPosts();
    }
    else 
      response = await searchPosts(this.state.search);
    const posts = [...response.data.result];    
    this.setState({ posts: posts});
  }

  render() {
    const { length: count } = this.state.posts;    
    const { user } = this.props;

    // if (count === 0) return <p>There are no posts in the database.</p>;    

    return (
      <div className="row"> 
        <div className="col"> 
        {this.state.myPosts ? <h1>My Posts</h1> : <h1>Posts</h1>}
          
          {user && 
            (<button type="button" className="btn btn-primary" onClick={()=>{this.props.history.push("/posts/new");}}>Create New Post</button>
          )}

          <div className="row" style={{marginTop: "20px"}}>
            <div className={user ? "col-10" : "col-10"}>
              <div className="form-group">              
                <input id="search" className="form-control" name="search" value={this.state.search} 
                  onChange={(e)=>
                  {
                    this.setState({search : e.target.value});
                  }} 
                  onKeyDown = {(e)=>
                  {
                    if(e.key === "Enter" ){
                      this.handleSearch();
                    }
                  }} 
                />                
              </div>
            </div>
            {/* {user &&
              <div className="col-3">
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" name="myPosts" id="myPosts" style={{height: "17px", width:"17px"}}/>
                    <label className="form-check-label" htmlFor="myPosts"> My Posts</label>                  
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" name="private" id="private" style={{height: "17px", width:"17px"}}/>
                    <label className="form-check-label" htmlFor="private"> Private</label>                  
                </div>
              </div>
            } */}
            <div className="col-1">
              <button type="button" className="btn btn-primary" onClick={()=>{this.handleSearch()}}>Search</button>
            </div>
          </div>
          
           
          {this.state.posts.map(post => (
            <div className="card" style={{margin: "10px 0"}} key={post.blog_id}>
                <div className="card-body">
                    <h5 className="card-title">{post.title}</h5>                
                    <p className="card-text">{post.body}</p>                    
                    {(post.posted_by === this.state.userId) && (
                      <React.Fragment>
                        <Link to={`/posts/${post.blog_id}`} style={{marginRight: "15px", textDecoration: "underline" }}>Edit</Link>
                        <a href="#" className="card-link" style={{color: "red", textDecoration: "underline"}} onClick={()=>this.handleDelete(post)}>Delete</a>
                      </React.Fragment>
                    )}
                    <p className="card-text" style={{fontStyle: "italic", marginTop: "5px"}}>Posted by {post.author} on {post.posted_timestamp}</p>  
                </div>
            </div>
          ))}           
        </div>
      </div>
    );
  }
}

export default Posts;
