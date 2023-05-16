import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getPosts, deletePost, searchPosts } from "../services/postService";
import auth from "../services/authService";
import moment from "moment"; //for date time format
import DOMPurify from 'isomorphic-dompurify';

class Posts extends Component {
  state = {
    posts: [],
    userId: "",
    search: ""
  };
  
  //display the posts on page load
  async componentDidMount() {
    const currentUser = auth.getCurrentUser();
    const userId = (currentUser) ? currentUser._id : "";     
    let response = await getPosts();
    const posts = [...response.data.result];    
    this.setState({ posts: posts, userId: userId });    
  }

  handleDelete = async post => {
    //confirm with user before deleting the post
    if(window.confirm(`Do you want to delete the post "${post.title}" ?`)){
      const originalPosts = this.state.posts;
      const posts = originalPosts.filter(m => m.id !== post.blog_id);
      this.setState({ posts: posts });
  
      try {
        await deletePost(post.blog_id);
        toast.success("Post deleted!!");
        //load the posts after deletion
        await this.handleSearch();
      } catch (ex) {
        if (ex.response && ex.response.status === 404)
          toast.error("This post has already been deleted.");
  
        this.setState({ posts: originalPosts });
      }
    }
  };

  //function to search the posts based on search keyword in title or body 
  handleSearch = async () =>{
    if(this.state.search.length>150){
      toast.error('too lengthy characters for search');
      return;
    }
    let searchKey = DOMPurify.sanitize(this.state.search);
    if(searchKey!==this.state.search){
      toast.error('Invalid input');
      return;
    }
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
    const { user } = this.props;   

    return (
      <div className="row"> 
        <div className="col"> 
        <h1>Posts</h1>
          {/* create new post available only for authenticated users */}
          {user && 
            (<button type="button" className="btn btn-primary" onClick={()=>{this.props.history.push("/posts/new");}}>Create New Post</button>
          )}

          <div className="row" style={{marginTop: "20px"}}>
            <div className={user ? "col-10" : "col-10"}>
              <div className="form-group">              
                <input id="search" className="form-control" name="search" value={this.state.search} maxlength="150" 
                placeholder="Enter text for search"
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
                <p>Maximum allowed characters: 150</p>                
              </div>
            </div>
            <div className="col-1">
              <button type="button" className="btn btn-primary" onClick={()=>{this.handleSearch()}}>Search</button>
            </div>
          </div>
          
          {/* loop through the posts and display them in cards */}
          {this.state.posts.map(post => (
            <div className="card" style={{margin: "10px 0"}} key={post.blog_id}>
                <div className="card-body">
                    <h5 className="card-title">{post.is_private && <i class="fa-solid fa-lock"></i>} {post.title}</h5>                
                    <p className="card-text">{post.body}</p>                    
                    {(post.posted_by === this.state.userId) && (
                      <React.Fragment>
                        <Link to={`/posts/${post.blog_id}`} style={{marginRight: "15px", textDecoration: "underline" }}>Edit</Link>
                        <a href="#" className="card-link" style={{color: "red", textDecoration: "underline"}} onClick={()=>this.handleDelete(post)}>Delete</a>
                      </React.Fragment>
                    )}
                    <p className="card-text" style={{fontStyle: "italic", marginTop: "5px"}}>Posted by {post.author} on {moment(post.posted_timestamp).format('DD MMM YYYY hh:mm A')}</p>  
                </div>
            </div>
          ))}           
        </div>
      </div>
    );
  }
}

export default Posts;
