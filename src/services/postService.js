import http from "./httpService";
import { apiUrl } from "../config.json";

//const apiEndpoint = apiUrl + "/posts";
const apiEndpoint = "/posts";

function postUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export async function getPosts() {
  const response = await http.get('/blog/v1');  
  return response;
}


export async function getPost(postId) {
  const response = await http.get('/blog/v1/' + postId);
  return response;
}

export function savePost(post) {
  if (post.blog_id && post.blog_id!='new') {
    const body = { ...post };
    delete body.blog_id;
    return http.put('/blog/v1/' + post.blog_id, body);
  }

  return http.post('/blog/v1', post);
}

export function deletePost(postId) {
  return http.delete(postUrl(postId));
}
