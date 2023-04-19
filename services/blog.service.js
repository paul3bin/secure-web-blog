const db = require("./db.service");
const auth = require("../utils/auth");
const { PreparedStatement: PS } = require("pg-promise");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const redisClient = redis.createClient();

async function getById(id, user) {
  const getBlogById = new PS({
    name: "get-blog-byId",
    text: `select 
      blog_id, title, body, posted_by, posted_timestamp, modified_by, modified_timestamp, is_private
      from "DSS".tbl_blog_Data where blog_id=$1`,
    values: [id],
  });

  const result = await db.callQuery(getBlogById);

  if (result != null && result.length > 0) {
    if (result[0].is_private) {
      if (user != null && result[0].posted_by == user._id) {
        return { status: "pass", data: result[0] };
      } else {
        return { status: "unauthorized", message: "Access Denied" };
      }
    } else {
      return { status: "pass", data: result[0] };
    }
  } else {
    return { status: "fail", data: result[0] };
  }
}

async function getAll(user) {
  //console.log("user get all", user);
  var query = `select 
      blog_id, title, body, posted_by, posted_timestamp, modified_by, modified_timestamp, is_private
      from "DSS".tbl_blog_Data where is_private = false`;
  if (user != null) {
    query =
      query +
      ` union select
      blog_id, title, body, posted_by, posted_timestamp, modified_by, modified_timestamp, is_private
      from "DSS".tbl_blog_Data where is_private = true and posted_by = $1`;
  }
  const getBlog = new PS({
    name: "get-blog",
    text: query,
    values: user != null ? [user._id] : [],
  });
  const result = await db.callQuery(getBlog);
  if (result) {
    return { status: "pass", result };
  }
  return { status: "fail", result };
}

async function create(blog) {
  const insertBlog = new PS({
    name: "insert-blog",
    text: 'Insert into "DSS".tbl_blog_data(title, body, posted_by, posted_timestamp, is_private) Values($1,$2,$3,$4, $5) Returning blog_id',
    values: [
      blog.title,
      blog.body,
      blog.posted_by,
      blog.posted_timestamp,
      blog.is_private || false,
    ],
  });

  const result = await db.callQuery(insertBlog);
  //console.log(result);
  if (result != null && result.length > 0) {
    return { status: "pass", message: "Blog created succesfully." };
  } else {
    return { status: "fail", message: "Error saving blog." };
  }
}

async function update(id, blog) {
  const findBlog = new PS({
    name: "find-blog",
    text: 'select blog_id, posted_by, is_private from "DSS".tbl_blog_data where blog_id = $1',
    values: [id],
  });
  const blogResult = await db.callQuery(findBlog);
  //console.log(blogResult);
  if (blogResult != null && blogResult.length > 0) {
    if (blogResult[0].posted_by != blog.posted_by) {
      return { status: "unauthorized", message: "Access denied" };
    }

    const updateBlog = new PS({
      name: "update-blog",
      text: 'Update "DSS".tbl_blog_data set title = $1, body=$2, modified_by=$3, modified_timestamp=$4, is_private = $5 where blog_id=$6',
      values: [
        blog.title,
        blog.body,
        blog.posted_by,
        "now()",
        blog.is_private || false,
        id,
      ],
    });
    const updateResult = await db.callQuery(updateBlog);
    //console.log(updateResult);
    if (updateResult) {
      return { status: "pass", message: "Blog updated succesfully" };
    } else {
      return { status: "fail", message: "Error updating blog" };
    }
  } else {
    return { status: "fail", message: "Blog not found" };
  }
}

async function remove(id) {
  const findBlog = new PS({
    name: "find-blog",
    text: 'select blog_id, posted_by, is_private from "DSS".tbl_blog_data where blog_id = $1',
    values: [id],
  });
  const blogResult = await db.callQuery(findBlog);
  //console.log(blogResult);
  if (blogResult != null && blogResult.length > 0) {
    if (blogResult[0].posted_by != blog.posted_by) {
      return { status: "unauthorized", message: "Access denied" };
    }

    const deleteBlog = new PS({
      name: "delete-blog",
      text: 'Delete from "DSS".tbl_blog_data where blog_id=$1',
      values: [id],
    });
    const deleteResult = await db.callQuery(deleteBlog);

    if (deleteResult) {
      return { status: "pass", message: "Blog deleted succesfully" };
    } else {
      return { status: "fail", message: "Error deleting blog" };
    }
  } else {
    return { status: "fail", message: "Blog not found" };
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  getById,
};
