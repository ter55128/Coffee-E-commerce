import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/articles`;

class ArticleService {
  postArticle(articleData) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.post(`${API_URL}`, articleData, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  }

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

  deleteArticle(id) {
    return axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
  }
}

export default new ArticleService();
