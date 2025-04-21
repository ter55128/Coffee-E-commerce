import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/knowledges`;

class KnowledgeService {
  getAllTitles() {
    return axios.get(API_URL);
  }
  getContent(title) {
    return axios.get(`${API_URL}/${encodeURIComponent(title)}`);
  }
}

export default new KnowledgeService();
