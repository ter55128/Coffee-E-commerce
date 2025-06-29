import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/beans`;

class BeansService {
  post(title, weight, cultivar, processing, roast, description, price) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.post(
      API_URL,
      {
        title,
        weight,
        cultivar,
        processing,
        roast,
        description,
        price,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
  getStoreBeans(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.get(`${API_URL}/store/${_id}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  getBeanById(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.get(`${API_URL}/${_id}`, {
      headers: {
        Authorization: token,
      },
    });
  }
  updateBean(_id, formData) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios.patch(`${API_URL}/${_id}`, formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  postBean(formData) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.post(`${API_URL}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token,
      },
    });
  }

  deleteBean(_id) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.delete(`${API_URL}/${_id}`, {
      headers: {
        Authorization: token,
      },
    });
  }
}
export default new BeansService();
