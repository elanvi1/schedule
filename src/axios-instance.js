const axios = require('axios').default;

const instance = axios.create({
  baseURL:'from_firebase'
})

export default instance;