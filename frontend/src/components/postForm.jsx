import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getPost, savePost } from "../services/postService";
import { getCSRF } from "../services/authService";
import auth from "../services/authService";

class PostForm extends Form {
  state = {
    data: {
      title: "",
      body: "",
      isPrivate: false,
      newPost: true
    },    
    userId: "",
    errors: {}
  };

  schema = {
    blog_id: Joi.number().integer(),
    title: Joi.string()
      .required()
      .label("Title"),
    /*body: Joi.string()
      .allow('').optional()*/
    body: Joi.string()
      .required()
      .max(200)
      .label("Body"),
    isPrivate : Joi.boolean(),
    newPost: Joi.boolean(),
    postedBy: Joi.string().optional()
  };

  async populatePost() {
    try {
      let postId = this.props.match.params.id;
      if(postId === undefined){
          postId = this.props.path.endsWith('posts/new') ? 'new' : '';
      }
      if (postId === "new") {
        this.setState({ data: {...this.state.data, newPost: true}});
        return;
      }
      
      this.setState({ data: {...this.state.data, newPost: false}});
      const response = await getPost(postId);
      if(response.status === 200 && response.data.status === 'pass'){
        const post = response.data.data;
        this.setState({ data: this.mapToViewModel(post) });
      }
      
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {  
    const currentUser = auth.getCurrentUser();
    const userId = (currentUser) ? currentUser._id : "";   
    if(userId) 
      this.setState({userId: userId})
    // else
    //   this.props.history.push("/login");
    await this.populatePost();
  }

  mapToViewModel(post) {
    return {
      blog_id: post.blog_id,
      title: post.title,
      body: post.body,
      isPrivate: post.is_private,
      postedBy: post.posted_by
    };
  }

  doSubmit = async () => {
    let blog = {
      blog_id: this.state.data.blog_id,
      title: this.state.data.title,
      body: this.state.data.body,
      isPrivate: this.state.data.isPrivate
    }
    await savePost(blog);

    this.props.history.push("/posts");
  };

  render() {
    return (
      <div>
        <h1>Post</h1>
        <form onSubmit={this.handleSubmit}>
        {(this.state.data.newPost || this.state.data.postedBy === this.state.userId) ?
          <React.Fragment>
              {this.renderInput("title", "Title", "text", "required" )}
              {/* {this.renderInput("body", "Body", "text", "required")} */}
              {this.renderTextArea("body", "Body", "required")}             
              {this.renderCheckbox("isPrivate", "Is Private Blog?")}    
              {this.renderButton("Save")} 
              <button style={{marginLeft: "15px"}} onClick={()=>{this.props.history.push("/posts");}} className="btn btn-secondary">
                Cancel
              </button>
            </React.Fragment>
          :
          
            <React.Fragment>
              <h4>Title</h4>
              <p>
                {this.state.data.title}
              </p>
              <h4>Body</h4>
              <p>
                {this.state.data.body}
              </p>
            </React.Fragment>
          }
        </form>
      </div>
    );
  }
}

export default PostForm;
