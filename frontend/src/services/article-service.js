import axios from "axios";
const API_URL = "http://localhost:8080/api/articles";

class ArticleService {
  // 發表新文章
  postArticle(articleData) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.post(API_URL, articleData, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  }

  // 發表評論
  postComment(articleId, replyContent) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.post(`${API_URL}/${articleId}/comment`, replyContent, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 更新文章
  updateArticle(id, updateData) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.patch(`${API_URL}/${id}`, updateData, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 刪除文章
  deleteArticle(id) {
    return axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
  }
}

export default new ArticleService();
