import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getPost, savePost } from "../services/postService";
import auth from "../services/authService";
import DOMPurify from 'isomorphic-dompurify';
import { toast } from "react-toastify";

class PostForm extends Form {
  state = {
    data: {
      title: "",
      body: "",
      isPrivate: false,
      newPost: false
    },    
    userId: "",
    errors: {}
  };
  //validate the inputs using Joi
  schema = {
    blog_id: Joi.number().integer(),
    title: Joi.string()
      .max(150)
      .required()
      .label("Title"),
    body: Joi.string()
      .required()
      .max(500)
      .label("Body"),
    isPrivate : Joi.boolean(),
    newPost: Joi.boolean(),
    postedBy: Joi.string().optional()
  };

  async populatePost() {
    try {
      let postId = this.props.match.params.id;
      //since posts/new is added as a separate route, params.id is returned as undefined.
      //so check the path and update the id
      if(postId === undefined){
        postId = (this.props.match.path === '/posts/new') ? 'new' : '';
      }
      
      let id = DOMPurify.sanitize(postId);
      if(id!==postId){
        toast.error('Invalid request');
        return;
      }
      
      if (postId === "new") {
        this.setState({ data: {...this.state.data, newPost: true}});
        return;
      }
      //if it is not a new post, get the post from database using id
      this.setState({ data: {...this.state.data, newPost: false}});
      const response = await getPost(postId);
      if(response.status === 200 && response.data.status === 'pass'){
        const post = response.data.data;
        this.setState({ data: this.mapToViewModel(post) });
      }
      
    } catch (ex) {
      console.log(ex);
      if (ex.response && ex.response.status === 404)
        this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {  
    const currentUser = auth.getCurrentUser();
    const userId = (currentUser) ? currentUser._id : ""; 
    //userid is set in the state to display the edit and delete options for the blogs posted by the logged in user  
    if(userId) 
      this.setState({userId: userId}) 
    await this.populatePost();
  }

  //mapping UI model to database schema
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
    //sanitize the inputs before submitting to the API 
    let title = DOMPurify.sanitize(this.state.data.title,{ALLOWED_TAGS: []});
    let body = DOMPurify.sanitize(this.state.data.body,{ALLOWED_TAGS: []});
    if(title !== this.state.data.title || body !== this.state.data.body ){
        toast.error('Invalid input');
        return;
    }
    let blog = {
      blog_id: this.state.data.blog_id,
      title: DOMPurify.sanitize(this.state.data.title,{ALLOWED_TAGS: []}),
      body: DOMPurify.sanitize(this.state.data.body,{ALLOWED_TAGS: []}),
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
        {/* display is_private checkbox, save and cancel buttons only for the authorized user access */}
        {(this.state.data.newPost || this.state.data.postedBy === this.state.userId) ?
          <React.Fragment>
              {this.renderInput("title", "Title", "text", "required" )}
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
