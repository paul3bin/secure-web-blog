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

export async function getMyPosts() {
  const response = await http.get('/blog/user/v1');  
  return response;
}

export async function getPost(postId) {
  const response = await http.get('/blog/v1/' + postId);
  return response;
}

export async function savePost(post) {
  if (post.blog_id && post.blog_id!='new') {
    const body = { ...post };
    delete body.blog_id;
    http.setCSRF();
    return await http.put('/blog/v1/' + post.blog_id, body);
  }
  else{
    http.setCSRF();
    return await http.post('/blog/v1', post);
  }  
}

export async function deletePost(postId) {
  http.setCSRF();
  return await http.delete('/blog/v1/' + postId);
}

export async function searchPosts(search) {
  const response = await http.post('/blog/search/v1', {search: search});  
  return response;
}
