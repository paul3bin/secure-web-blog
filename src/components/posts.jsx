import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
//import ListGroup from "./common/listGroup";
import { getPosts, deletePost } from "../services/postService";
import _ from "lodash";
import auth from "../services/authService";
import SearchBox from "./searchBox";


class Posts extends Component {
  state = {
    posts: [],
    userId: ""
  };

  async componentDidMount() {
    const currentUser = auth.getCurrentUser();
    const userId = (currentUser) ? currentUser._id : ""; 
    const response = await getPosts();
    const posts = [...response.data.result];    
    this.setState({ posts: posts, userId: userId });
    console.log(this.state.userId);
  }

  handleDelete = async post => {
    const originalPosts = this.state.posts;
    const posts = originalPosts.filter(m => m._id !== post._id);
    this.setState({ posts });

    try {
      await deletePost(post._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This post has already been deleted.");

      this.setState({ posts: originalPosts });
    }
  };


  render() {
    const { length: count } = this.state.posts;    
    const { user } = this.props;

    if (count === 0) return <p>There are no posts in the database.</p>;    

    return (
      <div className="row"> 
        <div className="col">          
          <h1>Posts</h1>
          {user && 
            (<button type="button" className="btn btn-primary" onClick={()=>{this.props.history.push("/posts/new");}}>Create New Post</button>
          )}
          {/* <SearchBox value={searchQuery} onChange={this.handleSearch} /> */}
           
          {this.state.posts.map(post => (
            <div className="card" style={{margin: "10px 0"}} key={post.blog_id}>
                <div className="card-body">
                    <h5 className="card-title">{post.title}</h5>                
                    <p className="card-text">{post.body}</p>                    
                    {(post.posted_by === this.state.userId) && (
                      <React.Fragment>
                        <Link to={`/posts/${post.blog_id}`} style={{marginRight: "15px", textDecoration: "underline" }}>Edit</Link>
                        <a href="#" className="card-link" style={{color: "red", textDecoration: "underline"}}>Delete</a>
                      </React.Fragment>
                    )}
                </div>
            </div>
          ))}           
        </div>
      </div>
    );
  }
}

export default Posts;
