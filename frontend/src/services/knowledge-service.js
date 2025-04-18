import axios from "axios";
const API_URL = "http://localhost:8080/api/knowledges";

class KnowledgeService {
  getAllTitles() {
    return axios.get(API_URL);
  }
  getContent(title) {
    return axios.get(`${API_URL}/${encodeURIComponent(title)}`);
  }
}

export default new KnowledgeService();
