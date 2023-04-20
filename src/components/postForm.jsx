import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getPost, savePost } from "../services/postService";

class PostForm extends Form {
  state = {
    data: {
      title: "",
      body: "",
      isPrivate: false
    },    
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
    isPrivate : Joi.boolean()
  };

  async populatePost() {
    try {
      const postId = this.props.match.params.id;
      if (postId === "new") return;

      const response = await getPost(postId);
      if(response.status == 200 && response.data.status == 'pass'){
        const post = response.data.data;
        this.setState({ data: this.mapToViewModel(post) });
      }
      
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {    
    await this.populatePost();
  }

  mapToViewModel(post) {
    return {
      blog_id: post.blog_id,
      title: post.title,
      body: post.body,
      isPrivate: post.is_private
    };
  }

  doSubmit = async () => {
    await savePost(this.state.data);

    this.props.history.push("/posts");
  };

  render() {
    return (
      <div>
        <h1>Post</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("title", "Title", "text", "required" )}
          {/* {this.renderInput("body", "Body", "text", "required")} */}
          {this.renderTextArea("body", "Body", "required")} 
          {this.renderCheckbox("isPrivate", "Is Private Blog?")}          
          {this.renderButton("Save")} 
          <button style={{marginLeft: "15px"}} onClick={()=>{this.props.history.push("/posts");}} className="btn btn-secondary">
            Cancel
          </button>
        </form>
      </div>
    );
  }
}

export default PostForm;
