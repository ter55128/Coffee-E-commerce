import axios from "axios";
const API_URL = "http://localhost:8080/api/user/";

class AuthService {
  login(email, password) {
    return axios.post(API_URL + "/login", { email, password });
  }
  logout() {
    localStorage.removeItem("user");
  }
  register(username, email, password, role) {
    return axios.post(API_URL + "/register", {
      username,
      email,
      password,
      role,
    });
  }
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
  updateProfile(updateData) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }

    return axios
      .patch(API_URL + "profile", updateData, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        if (response.data.token) {
          const user = JSON.parse(localStorage.getItem("user"));
          user.token = response.data.token;
          localStorage.setItem("user", JSON.stringify(user));
        }
        return response;
      });
  }
  updateRole(role) {
    return axios.post(
      API_URL + "/role",
      { role },
      {
        headers: {
          Authorization: this.getCurrentUser()?.token,
        },
      }
    );
  }

  getUserProfile(id) {
    return axios.get(API_URL + `publicProfile/${id}`, { id });
  }

  forgotPassword(email) {
    return axios.post(API_URL + "forgot-password", { email });
  }
  resetPassword(token, newPassword) {
    return axios.post(API_URL + `reset-password/${token}`, { newPassword });
  }
}

export default new AuthService();
